import imageBg from '../assets/image.png';

function InviteFriendsCard({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="relative w-full rounded-lg p-6 border border-emerald-400/50 glow-border glow-border-hover hover:shadow-lg hover:shadow-emerald-500/20 transition-all cursor-pointer text-left overflow-hidden"
      style={{
        backgroundImage: `url(${imageBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
      >
      <div className="relative z-10">
        <h3 className="text-lg font-bold text-white mb-1">
          Invite Friends
        </h3>
        <p className="text-sm text-emerald-100">
          Earn income
        </p>
      </div>
    </button>
  );
}

export default InviteFriendsCard;

