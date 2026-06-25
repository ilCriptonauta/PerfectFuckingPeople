export function LoadingSkeleton() {
    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '30px',
            padding: '20px 0',
            width: '100%'
        }}>
            {[...Array(8)].map((_, i) => (
                <div key={i} className="glass-panel" style={{ 
                    width: '100%', 
                    aspectRatio: '1/1.2',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        width: '100%',
                        aspectRatio: '1/1',
                        background: 'rgba(255,255,255,0.05)',
                        animation: 'pulse 1.5s infinite ease-in-out'
                    }} />
                    <div style={{ padding: '16px', flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '10px' }}>
                        <div style={{ height: '24px', width: '70%', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', animation: 'pulse 1.5s infinite ease-in-out' }} />
                        <div style={{ height: '16px', width: '40%', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', animation: 'pulse 1.5s infinite ease-in-out' }} />
                    </div>
                </div>
            ))}
            <style>{`
                @keyframes pulse {
                    0% { opacity: 0.6; }
                    50% { opacity: 0.3; }
                    100% { opacity: 0.6; }
                }
            `}</style>
        </div>
    );
}
