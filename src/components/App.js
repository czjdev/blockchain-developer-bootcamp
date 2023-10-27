import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import config from '../config.json';
import { loadProvider, loadNetwork, loadAccount, loadTokens, loadExchange } from '../store/interactions';
import Navbar from './Navbar';
import Markets from './Markets';
import Balance from './Balance';

function App() {
  const dispatch = useDispatch();

  const loadBlockchainData = async () => {
    // connect ethers to blockchain
    const provider = loadProvider(dispatch);

    // fetch current network's chainId(e.g hardhat: 31337, kovan: 42)
    const chainId = await loadNetwork(provider, dispatch);

    // realod page when networks changes
    window.ethereum.on('chainChanged', () => {
      window.location.reaload()
    })

    // fetch current account & balance from metamask when changed
    window.ethereum.on('accountsChanged', () => {
      loadAccount(provider, dispatch)
    })
    // await loadAccount(provider, dispatch);

    // load token smart contract
    const DApp = config[chainId].DApp;
    const mETH = config[chainId].mETH;
    await loadTokens(provider, [DApp.address, mETH.address], dispatch);

    // load exchange smart contract
    const exchangeConfig = config[chainId].exchange;
    await loadExchange(provider, exchangeConfig.address, dispatch);
  }

  useEffect(() => {
    loadBlockchainData()
  })

  return (
    <div>

      <Navbar />

      <main className='exchange grid'>
        <section className='exchange__section--left grid'>

          <Markets />

          <Balance />

          {/* Order */}

        </section>
        <section className='exchange__section--right grid'>

          {/* PriceChart */}

          {/* Transactions */}

          {/* Trades */}

          {/* OrderBook */}

        </section>
      </main>

      {/* Alert */}

    </div>
  );
}

export default App;
