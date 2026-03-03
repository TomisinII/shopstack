import { useState, useEffect } from 'react';

export default function Countdown({ endTime }) {
    const calc = () => {
        const diff = Math.max(0, new Date(endTime) - Date.now());
        return {
            h: String(Math.floor(diff / 3600000)).padStart(2, '0'),
            m: String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0'),
            s: String(Math.floor((diff % 60000) / 1000)).padStart(2, '0'),
        };
    };

    const [time, setTime] = useState(calc);

    useEffect(() => {
        const id = setInterval(() => setTime(calc()), 1000);
        return () => clearInterval(id);
    }, [endTime]);

    const Block = ({ value, label }) => (
        <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-gray-800 rounded-xl flex items-center justify-center">
                <span className="text-2xl font-bold text-white tabular-nums">{value}</span>
            </div>
            <span className="text-xs text-gray-500 mt-1.5 uppercase tracking-wide">{label}</span>
        </div>
    );

    return (
        <div className="flex items-center gap-3">
            <Block value={time.h} label="Hours" />
            <span className="text-2xl font-bold text-gray-600 mb-5">:</span>
            <Block value={time.m} label="Mins" />
            <span className="text-2xl font-bold text-gray-600 mb-5">:</span>
            <Block value={time.s} label="Secs" />
        </div>
    );
}
