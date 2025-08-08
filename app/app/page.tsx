export default function Home() {
  return (
    <main style={{
      display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',
      height:'100vh',background:'linear-gradient(135deg,#0f172a,#111827)',color:'#fff'
    }}>
      <h1 style={{fontSize:'2.5rem',marginBottom:'0.75rem'}}>🐾 Welcome to Fetch</h1>
      <p style={{opacity:.8,maxWidth:560,textAlign:'center'}}>
        Your pup/handler & furry community hub is online. Profiles, chat, events—coming soon.
      </p>
    </main>
  );
}
