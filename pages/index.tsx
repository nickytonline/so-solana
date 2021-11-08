import { useState, useEffect } from 'react';
import type { NextPage } from 'next';
import Link from 'next/link';
import Head from 'next/head';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { LoadingIndicator } from '@components/LoadingIndicator';
import { InstallPhantomWallet } from '@components/InstallPhantomWallet';
import { Wallet } from '@components/Wallet';
import { GifGrid, GifGridImage } from '@components/GifGrid';
import { Button } from '@components/Button';
import rawIdl from '@utilties/idl.json';
import {
  Cluster,
  clusterApiUrl,
  ConfirmOptions,
  Connection,
  PublicKey,
} from '@solana/web3.js';
import { Program, Provider, web3 } from '@project-serum/anchor';
import keypair from '@utilties/keypair.json';

type SolanaProvider = typeof window.solana;

const uints = Object.values(keypair._keypair.secretKey);
const secret = new Uint8Array(uints);
const baseAccount = web3.Keypair.fromSecretKey(secret);
const idl: any = rawIdl; // TODO fix type

function getProvider() {
  const connection = new Connection(
    network,
    confirmationOptions.preflightCommitment,
  );
  const provider = new Provider(connection, window.solana, confirmationOptions);
  return provider;
}

function isMobile() {
  return /mobile|ipad|iphone|ios/i.test(navigator.userAgent.toLowerCase());
}

// SystemProgram is a reference to the Solana runtime!
const { SystemProgram, Keypair } = web3;

// Get our program's id form the IDL file.
const programID = new PublicKey(idl.metadata.address);

const cluster: Cluster = 'devnet';

// Set our network to devnet.
const network = clusterApiUrl(cluster);

// Control's how we want to acknowledge when a trasnaction is "done".
const confirmationOptions: ConfirmOptions = {
  preflightCommitment: 'processed',
};

const Home: NextPage = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [walletAddress, setWalletAddress] = useState<string | undefined>();
  const [gifLink, setGifLink] = useState<string | null>(null);
  const [gifList, setGifList] = useState<GifGridImage[] | null>(null);

  // async function createGifAccount() {
  //   const toastId = baseAccount.publicKey.toString();

  //   try {
  //     const provider = getProvider();
  //     const program = new Program(idl, programID, provider);
  //     toast.info('Creating BaseAccount account', {
  //       autoClose: false,
  //       toastId,
  //     });
  //     await program.rpc.startStuffOff({
  //       accounts: {
  //         baseAccount: baseAccount.publicKey,
  //         user: provider.wallet.publicKey,
  //         systemProgram: SystemProgram.programId,
  //       },
  //       signers: [baseAccount],
  //     });
  //     console.log(
  //       'Created a new BaseAccount w/ address:',
  //       baseAccount.publicKey.toString(),
  //     );
  //     toast.dismiss(toastId);
  //     toast.info(
  //       `Created a new BaseAccount with address: ${baseAccount.publicKey.toString()}`,
  //     );
  //     await getGifList();
  //   } catch (error) {
  //     toast.error('There was an issue creating the BaseAccount account');
  //     console.log('Error creating BaseAccount account:', error);
  //   } finally {
  //     toast.dismiss(toastId);
  //   }
  // }

  async function getGifList() {
    const provider = getProvider();
    const program = new Program(idl, programID, provider);
    const account = await program.account.baseAccount.fetch(
      baseAccount.publicKey,
    );

    console.log('Got the account', account);
    setGifList(account.gifList);
  }

  function stopLoading() {
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }

  async function sendGif() {
    if (
      !gifLink ||
      gifLink.length === 0 ||
      !/https:\/\/media.giphy.com.+/.test(gifLink)
    ) {
      toast.error(
        <p>
          Please enter a{' '}
          <Link href="https://giphy.com/search/yolo" passHref>
            <a target="blank" rel="noopener">
              giphy.com
            </a>
          </Link>{' '}
          GIF link
        </p>,
      );
      return;
    }

    const toastId = `gifLink-${new Date().getTime()}`;

    try {
      toast.info('Adding GIF 🖼️', { autoClose: false, toastId });
      const provider = getProvider();
      const program = new Program(idl, programID, provider);

      await program.rpc.addGif(gifLink, {
        accounts: {
          baseAccount: baseAccount.publicKey,
        },
      });
      console.log('GIF sucesfully sent to program', gifLink);
      toast.dismiss(toastId);
      setGifLink(null);

      await getGifList();
    } catch (error) {
      console.log('Error sending GIF:', error);
      toast.error('There was an issue sending the GIF');
    } finally {
      toast.dismiss(toastId);
    }
  }

  useEffect(() => {
    async function checkIfWalletIsConnected(solana: SolanaProvider) {
      try {
        solana.connect(); // { onlyIfTrusted: true }
      } catch (error) {
        console.dir(error);
        toast.error('An unknown error occurred connecting your account.');
      } finally {
        stopLoading();
      }
    }

    function onPhantomLoad() {
      const { solana } = window;

      if (!solana?.isPhantom) {
        stopLoading();
        toast.error(<InstallPhantomWallet isMobile={isMobile()} />, {
          autoClose: false,
        });
        return;
      }

      checkIfWalletIsConnected(solana);

      solana.on('connect', async (publicKey: { toString: () => string }) => {
        console.log('Connected with Public Key:', publicKey.toString());

        try {
          setWalletAddress(publicKey.toString());
          getGifList();
          toast.info(
            <p>
              Connected with wallet address:{' '}
              <span sx={{ wordBreak: 'break-word' }}>
                {publicKey.toString()}
              </span>
            </p>,
          );
        } catch (error) {
          toast.error('Error retrieveing the GIF list.');
          console.log('Error in getGifs: ', error);
          setGifList(null);
        }
      });
    }

    window.addEventListener('load', onPhantomLoad);
    document.querySelector('.Toastify')?.setAttribute('aria-live', 'polite');

    return () => {
      window.removeEventListener('load', onPhantomLoad);
    };
  }, []);

  if (isLoading) {
    return <LoadingIndicator />;
  }

  return (
    <>
      <Head>
        <title>Welcome to YOLO Portal</title>
        <meta name="description" content="Welcome to Web3" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <header sx={{ margin: '1rem 0' }}>
        <h1 sx={{ fontFamily: 'heading' }}>
          Welcome to{' '}
          <span
            sx={{
              background: 'linear-gradient(to left,#c300ff 0%, #fff 100%)',
              backgroundClip: 'text',
              textFillColor: 'transparent',
            }}
          >
            YOLO Portal
          </span>
        </h1>
      </header>
      <main
        sx={{
          display: 'grid',
          gap: '1rem',
          width: [null, null, '50vw', '90vw'],
        }}
      >
        <ToastContainer />
        <p sx={{ textAlign: 'center', fontWeight: 700, color: 'accent' }}>
          Ensure that you are on the Solana {cluster} cluster
        </p>
        <Wallet
          walletAddress={walletAddress}
          connectWallet={() => {
            window.solana.connect();
          }}
        />
        {/* {gifList && (
          <Button onClick={createGifAccount}>
            Do One-Time Initialization For GIF Program Account
          </Button>
        )} */}
        {walletAddress && (
          <>
            <div sx={{ display: 'grid', placeItems: 'center' }}>
              <p>
                Enter a{' '}
                <Link href="https://giphy.com/search/yolo" passHref>
                  <a target="blank" rel="noopener">
                    giphy.com
                  </a>
                </Link>{' '}
                GIF link
              </p>
              <form
                sx={{ display: 'flex' }}
                onSubmit={(e) => {
                  e.preventDefault();
                }}
              >
                <input
                  type="url"
                  pattern="https://media.giphy.com/.+"
                  placeholder="Enter Giphy link!"
                  value={gifLink ?? ''}
                  onChange={(event) => {
                    setGifLink(event.target.value);
                  }}
                  required
                  sx={{
                    marginRight: '0.5rem',
                    width: [null, null, '25ch', '50ch'],
                  }}
                />
                <Button type="submit" onClick={sendGif}>
                  Submit
                </Button>
              </form>
            </div>
            <h2 sx={{ textAlign: 'center' }}>
              View your GIF collection in the{' '}
              <span
                sx={{
                  color: 'accent',
                  fontWeight: 700,
                  bordercolor: 'accent',
                  padding: '0.25rem',
                  marginRight: '0.1rem',
                  border: '1px dashed',
                }}
              >
                YOLO
              </span>
              verse ✨
            </h2>
            <GifGrid images={gifList} />
          </>
        )}
      </main>
      <footer>
        <nav>
          <ul
            sx={{
              listStyle: 'none',
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              placeItems: 'center',
              margin: 0,
              marginTop: '1rem',
              padding: 0,
              gridGap: '1rem',
              '& a': {
                color: '#c300ff',
              },
            }}
          >
            <li>
              <a href="https://github.com/nickytonline/so-solana">
                source code
              </a>
            </li>
            <li>
              <a href="https://timeline.iamdeveloper.com">about Nick</a>
            </li>
            <li>
              <a href="https://twitter.com/_buildspace">
                Built on Buildspace 🦄
              </a>
            </li>
          </ul>
        </nav>
      </footer>
    </>
  );
};

export default Home;
