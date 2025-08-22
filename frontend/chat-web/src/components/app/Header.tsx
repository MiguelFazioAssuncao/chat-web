import Logo from '../../assets/chatWebLogo.png';

const Header = () => {
  return (
    <header className='bg-[var(--primary-color)] text-white p-1 flex items-center   '>
      <img src={Logo} alt="ChatWeb Logo" className="h-11" />
        <h1>Chatweb</h1>
    </header>
  );
};


export default Header;
