// // CreatorEarnings.js
// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { useClerk } from '@clerk/clerk-react';

// const CreatorEarnings = () => {
//   const { user } = useClerk();
//   const userId = user?.id;
//   const [earnings, setEarnings] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [payoutAmount, setPayoutAmount] = useState('');
//   const [phoneNumber, setPhoneNumber] = useState('');
//   const [payoutMessage, setPayoutMessage] = useState('');

//   useEffect(() => {
//     const fetchEarnings = async () => {
//       try {
//         setLoading(true);
//         const response = await axios.get(`http://localhost:5000/api/picture/earnings/${userId}`);
//         setEarnings(response.data);
//       } catch (error) {
//         console.error('Error fetching earnings:', error);
//         setError('Could not retrieve earnings');
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (userId) fetchEarnings();
//   }, [userId]);

//   const handlePayoutRequest = async () => {
//     try {
//       const response = await axios.post('http://localhost:5000/api/payout/request-payout', {
//         creatorId: userId,
//         amount: parseFloat(payoutAmount),
//         phoneNumber,
//       });
//       setPayoutMessage(response.data.message);
//     } catch (error) {
//       setPayoutMessage('Error processing payout request');
//       console.error('Payout error:', error);
//     }
//   };

//   if (loading) return <p>Loading earnings...</p>;
//   if (error) return <p>{error}</p>;

//   return (
//     <div>
      // <h2>Your Earnings</h2>
      // {earnings ? (
      //   <div>
      //     <p>Total Earnings: ${earnings.totalEarnings.toFixed(2)}</p>
      //     <p>Number of Successful Payments: {earnings.paymentCount}</p>
      //   </div>
      // ) : (
      //   <p>No earnings data available.</p>
      // )}

//       <div>
//         <h3>Request Payout</h3>
//         <input
//           type="number"
//           placeholder="Amount"
//           value={payoutAmount}
//           onChange={(e) => setPayoutAmount(e.target.value)}
//         />
//         <input
//           type="text"
//           placeholder="Rwandan Mobile Money Phone Number"
//           value={phoneNumber}
//           onChange={(e) => setPhoneNumber(e.target.value)}
//         />
//         <button onClick={handlePayoutRequest}>Request Payout</button>
//         {payoutMessage && <p>{payoutMessage}</p>}
//       </div>
//     </div>
//   );
// };

// export default CreatorEarnings;

// CreatorEarnings.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useClerk } from '@clerk/clerk-react';
import './payout.css';
import BackButton from './backToPreviusButton';

const CreatorEarnings = () => {
  const { user } = useClerk();
  const userId = user?.id;
  
  const [earnings, setEarnings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [payoutMessage, setPayoutMessage] = useState('');
  const [requestData, setRequestData] = useState(null);
  const [ipError, setIpError] = useState(null);

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:5000/api/picture/earnings/${userId}`);
        setEarnings(response.data);
      } catch (error) {
        setError(error.response?.data?.message || 'Could not retrieve earnings');
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchEarnings();
  }, [userId]);

  const handlePayoutRequest = async () => {
    if (!payoutAmount || !phoneNumber) {
      setPayoutMessage('Please enter both an amount and a phone number');
      return;
    }
    
    try {
      setPayoutMessage('');
      setIpError(null);
      setRequestData(null);

      const response = await axios.post('http://localhost:5000/api/payout/request-payout', {
        creatorId: userId,
        amount: parseFloat(payoutAmount),
        phoneNumber,
      });

      setPayoutMessage(response.data.message);
      setRequestData(response.data.requestData);  // Set request data for display
    } catch (error) {
      if (error.response) {
        setPayoutMessage(error.response.data.message);
        setRequestData(error.response.data.requestData);

        // Show IP-related errors and specific error messages if available
        if (error.response.data.message === 'IP not whitelisted') {
          setIpError({
            ip: error.response.data.publicIP,
            message: error.response.data.error
          });
        }
      } else {
        setPayoutMessage('Network error: Could not reach the server');
      }
      console.error('Payout error:', error);
    }
  };

  return (
    <div className='payout'>
      <BackButton />
      <div className='ctn'>
        <h2>Your Earnings</h2>
        {loading ? (
          <p>Loading...</p>
        ) : earnings ? (
          <div>
            <p>Total Earnings: ${earnings.totalEarnings.toFixed(2)}</p>
            <p>Number of Successful Payments: {earnings.paymentCount}</p>
          </div>
        ) : (
          <p>{error || 'No earnings data available.'}</p>
        )}

        <div>
          <h3>Request Payout</h3>
          <input
            type="number"
            placeholder="Amount"
            value={payoutAmount}
            onChange={(e) => setPayoutAmount(e.target.value)}
          />
          <input
            type="text"
            placeholder="Rwandan Mobile Money Phone Number"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
          <button onClick={handlePayoutRequest}>Request Payout</button>
          
          {payoutMessage && <p className="error-message">{payoutMessage}</p>}
          
          {ipError && (
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative mt-4">
              <strong className="font-bold">IP Whitelisting Required!</strong>
              <p>Current IP Address: {ipError.ip}</p>
              <p>{ipError.message}</p>
            </div>
          )}

          {/* Display request data and error details if available */}
          {requestData && (
            <div className="request-data">
              <h4>Request Data:</h4>
              <p><strong>Amount:</strong> {requestData.amount}</p>
              <p><strong>Phone Number:</strong> {requestData.phoneNumber}</p>
              <p><strong>Creator ID:</strong> {requestData.creatorId}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreatorEarnings;