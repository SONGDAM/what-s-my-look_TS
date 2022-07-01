import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import google from '../assets/icon/google.png';
import { useRecoilState } from 'recoil';
import { authState } from '../recoil/authState';
import '../styles/Modal.css';
import { auth } from './firebase';

function Login() {
  const [authedUser, setAuth] = useRecoilState(authState);

  const signUpWithGoogle = () => {
    const provider = new GoogleAuthProvider();

    signInWithPopup(auth, provider).then((result) => {
      const user = {
        email: result.user.email,
        nickName: result.user.displayName,
        photo: result.user.photoURL,
      };

      setAuth(user);
      window.location.href = 'http://localhost:3000/';
    });
  };

  console.log(authedUser);

  // const logout = () => {
  //   signOut(auth).then(alert('logout!'));
  //   localStorage.removeItem('recoil-persist');

  //   navigate('/');
  // };

  return (
    <div>
      <button onClick={signUpWithGoogle}>
        <img src={google} alt='' className='login-button' />
      </button>
    </div>
  );
}

export default Login;
