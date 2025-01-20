import React, { useState, useEffect } from 'react';
import Web3 from "web3";
import { abi } from './SlotMachine.json';

function App() {
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [betAmount, setBetAmount] = useState('');
  const [slots, setSlots] = useState([]);
  const [payout, setPayout] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const contractAddress = "0x6D2D26fe03A034ED746a548682c5c33094968C49"; // Replace with your contract address
  const emojiMap = ['🎸', '🎻', '🥁', '🎺'];

  useEffect(() => {
    const loadWeb3 = async () => {
      if (window.ethereum) {
        const web3 = new Web3(window.ethereum);
        try {
          await window.ethereum.request({ method: 'eth_requestAccounts' });
          const accounts = await web3.eth.getAccounts();
          setAccount(accounts[0]);
          const slotContract = new web3.eth.Contract(abi, contractAddress);
          setContract(slotContract);
        } catch (error) {
          console.error("MetaMask connection failed:", error);
        }
      } else {
        alert("Please install MetaMask!");
      }
    };

    loadWeb3();
  }, []);

  const playGame = async () => {
    if (!betAmount || isNaN(betAmount) || betAmount <= 0) {
      alert("Enter a valid bet amount.");
      return;
    }

    if (!contract) {
      alert("Contract not loaded.");
      return;
    }

    setLoading(true);
    try {
      const result = await contract.methods.play().send({
        from: account,
        value: Web3.utils.toWei(betAmount, 'ether'),
      });

      const event = result.events.BetPlaced.returnValues;
      const resultSlots = event.slots.map((num) => parseInt(num));
      setSlots(resultSlots);
      setPayout(Web3.utils.fromWei(event.payout, 'ether'));
    } catch (error) {
      console.error("Error playing game:", error);
    } finally {
      setLoading(false);
    }
  };

  const rulesContent = `
    Rules:
    1. Place your bet in ETH.
    2. If all three slots match, you win 2x your bet.
    3. If two slots match, you win your bet amount.
    4. If no slots match, you lose the bet.
    5. The contract must have enough balance to cover payouts.
  `;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        fontFamily: 'Arial, sans-serif',
        textAlign: 'center',
      }}
    >
      <h1>📍 Get Slotty 📍</h1>
      <p>Welcome to the decentralized slot machine! Connect your wallet and luck.</p>
      <p>You are just one gamble away from generational wealth.</p>
  
      {account ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <p>
            Connected as: <strong>{account}</strong>
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '10px 0' }}>
            <label>
              Bet Amount (ETH):
              <input
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(e.target.value)}
                style={{ margin: '0 10px', padding: '5px' }}
              />
            </label>
            <button
              onClick={playGame}
              disabled={loading}
              style={{ padding: '10px 20px', cursor: 'pointer' }}
            >
              {loading ? 'Spinning...' : "Let's go"}
            </button>
          </div>
  
          {slots.length > 0 && (
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <h3>Your Result:</h3>
              <div style={{ fontSize: '50px', display: 'flex', justifyContent: 'center' }}>
                {slots.map((slot, idx) => (
                  <span key={idx}>{emojiMap[slot]} </span>
                ))}
              </div>
              <h4>{payout > 0 ? `You won ${payout} ETH! 🎉` : "Come back stronger, Champ!"}</h4>
            </div>
          )}
        </div>
      ) : (
        <p>Please connect your wallet to play.</p>
      )}
  
      <div
        style={{
          marginTop: '30px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <h2>📝 Features</h2>
  
        {/* Button to open Smart Contract */}
        <button
          style={{
            padding: '10px 20px',
            margin: '10px',
            cursor: 'pointer',
          }}
          onClick={() =>
            window.open(
              'https://gateway.pinata.cloud/ipfs/bafkreicq2fl2vinrvtoygcwb5omrkoqslhyj4lj3mfbid7eacwaoblmwci',
              '_blank'
            )
          }
        >
          Read Smart Contract Here
        </button>
  
        {/* Button to toggle rules */}
        <button
          style={{
            padding: '10px 20px',
            margin: '10px',
            cursor: 'pointer',
          }}
          onClick={() => setShowRules(!showRules)}
        >
          {showRules ? 'Hide Rules' : 'Show Rules'}
        </button>
  
        {showRules && (
          <div
            style={{
              border: '1px solid #ccc',
              padding: '10px',
              marginTop: '10px',
              borderRadius: '5px',
              textAlign: 'center',
              maxWidth: '120%',
            }}
          >
            <pre>{rulesContent}</pre>
          </div>
        )}
      </div>
    </div>
  );  
}

export default App;
