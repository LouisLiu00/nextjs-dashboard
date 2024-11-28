import { GlobeAltIcon, Squares2X2Icon } from '@heroicons/react/24/outline';

export default function AcmeLogo() {
  return (
    <div
      className={`flex flex-row items-center leading-none text-white`}
    >
      <Squares2X2Icon className="h-12 w-12 rotate-[0deg]" />
      <p className="text-[24px]">Dashboard</p>
    </div>
  );
}
