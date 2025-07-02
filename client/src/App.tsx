import { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  const [channel, setChannel] = useState('');
  const [message, setMessage] = useState('');
  const [time, setTime] = useState('');
  const [scheduled, setScheduled] = useState<any[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [alert, setAlert] = useState('');
  const [success, setSuccess] = useState('');
  const [channels, setChannels] = useState<any[]>([]);

  const backendUrl:any = import.meta.env.VITE_API_END;
  useEffect(() => {    
    checkConnection();
    loadScheduled();
  }, []);

  useEffect(() => {
    if (isConnected) {
      loadChannels();
    }
  }, [isConnected]);

  const loadChannels = async () => {
    try {
      const res:any = await axios.get(`${backendUrl}/messages/channels`);
      console.log(res);

      const filtered = res.data.filter((ch: any) => ch.is_channel && ch.is_member);
      setChannels(filtered);
    } catch {
      showAlert('Failed to load channels');
    }
  };


  const checkConnection = async () => {
    try {
      const res:any = await axios.get(`${backendUrl}/auth/status`);
      console.log(res);
      setIsConnected(res.data.connected);
    } catch {
      setIsConnected(false);
    }
  };

  const disconnectSlack = async () => {
    try {
      await axios.post(`${backendUrl}/auth/disconnect`);
      showSuccess('Disconnected from Slack');
      setIsConnected(false);
    } catch {
      showAlert('Failed to disconnect');
    }
  };

  const loadScheduled = async () => {
    try {
      const res:any = await axios.get(`${backendUrl}/messages/scheduled`);
      setScheduled(res.data);
    } catch {
      setScheduled([]);
    }
  };

  const sendNow = async () => {
    if (!channel || !message) {
      showAlert('Please select a channel and enter a message');
      return;
    }
    try {
      await axios.post(`${backendUrl}/messages/send`, { channel, message });
      showSuccess('Message sent successfully');
    } catch {
      showAlert('Failed to send message');
    }
  };

  const schedule = () => {
    if (!channel || !message || !time) {
      showAlert('Please fill all fields');
      return;
    }
    if (isNaN(Date.parse(time))) {
      showAlert('Invalid date format. Use YYYY-MM-DD HH:MM');
      return;
    }
    if (new Date(time).getTime() < Date.now()) {
      showAlert('Scheduled time must be in the future');
      return;
    }
    axios.post(`${backendUrl}/messages/schedule`, {
      channel,
      message,
      scheduledTime: time,
    }).then(() => {
      loadScheduled();
      showSuccess('New message scheduled');
    }).catch(() => showAlert('Failed to schedule message'));
  };

  const cancel = (id: number) => {
    axios.delete(`${backendUrl}/messages/scheduled/${id}`).then(loadScheduled);
  };

  const showAlert = (msg: string) => {
    setAlert(msg);
    setTimeout(() => setAlert(''), 5000);
  };
  const showSuccess = (msg: string) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(''), 5000);
  };

  return (
    <div className="p-8 max-w-xl mx-auto font-sans">
      <h1 className="text-3xl font-bold mb-6 text-center">Slack Connect App</h1>

      {alert && <div className="bg-red-100 text-red-800 p-3 rounded mb-4 text-center">{alert}</div>}
      {success && <div className="bg-green-100 text-green-800 p-3 rounded mb-4 text-center">{success}</div>}
      {isConnected && (
        <div className="bg-yellow-100 text-yellow-800 p-3 rounded mb-4 text-center">
          <button
            onClick={disconnectSlack}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded shadow"
          >Disconnect from Slack</button>
        </div>
      )}
      {!isConnected ? (
        <div className="text-center">
          <button
            onClick={() => window.location.href = `${backendUrl}/auth/slack`}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded shadow"
          >
            Connect to Slack
          </button>
        </div>
      ) : (
        <div className="bg-white shadow p-4 rounded mb-6">

          <div className="mb-4">
            <label className="block mb-1 font-medium">Select Channel</label>
            <select
              value={channel}
              onChange={(e) => setChannel(e.target.value)}
              className="border w-full p-2 rounded"
            >
              <option value="">-- Select a channel --</option>
              {channels.map((ch) => (
                <option key={ch.id} value={ch.id}>
                  {ch.name}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-medium">Message</label>
            <input
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Your message"
              className="border w-full p-2 rounded"
            />
          </div>

          <div className="mb-4">
            <label className="block mb-1 font-medium">Scheduled Time (YYYY-MM-DD HH:MM)</label>
            <input
              value={time}
              onChange={e => setTime(e.target.value)}
              placeholder="2025-07-01 16:30"
              className="border w-full p-2 rounded"
            />
          </div>

          <div className="flex gap-4">
            <button onClick={sendNow} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded">Send Now</button>
            <button onClick={schedule} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">Schedule</button>
          </div>
        </div>
      )}

      {isConnected && (
        <div>
          <h2 className="text-xl font-bold mb-2">Scheduled Messages</h2>
          {scheduled.length === 0 ? (
            <p className="text-gray-500">No scheduled messages</p>
          ) : (
            <ul className="space-y-2">
              {scheduled.map(msg => (
                <li key={msg.id} className="border p-3 rounded flex justify-between items-center">
                  <div>
                    <p className="font-medium">{msg.message}</p>
                    <p className="text-sm text-gray-500">Channel: {msg.channel} | Time: {msg.scheduled_time}</p>
                  </div>
                  <button onClick={() => cancel(msg.id)} className="text-red-500 hover:text-red-700">Cancel</button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default App;