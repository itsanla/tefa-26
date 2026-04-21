'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import Image from 'next/image';
import { Handshake, Building2 } from 'lucide-react';

// CSS for ticker animation
const tickerStyles = `
@keyframes scroll {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
}

.ticker-container {
  overflow: hidden;
  position: relative;
  background: rgba(16, 185, 129, 0.05);
  background-image: radial-gradient(rgba(16, 185, 129, 0.06) 1px, transparent 1px);
  background-size: 20px 20px;
  border-radius: 1rem;
  padding: 3rem 0;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  width: 100%;
}

.ticker-wrapper {
  display: flex;
  width: fit-content;
  animation: scroll 60s linear infinite;
}

.ticker-item {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 2.5rem;
  position: relative;
  transition: transform 0.3s ease, filter 0.3s ease;
  min-width: 14rem;
  max-width: 18rem;
  width: auto;
}

.ticker-item:hover {
  transform: translateY(-4px);
  filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1));
}

.ticker-image-container {
  position: relative;
  width: 10rem;
  height: 10rem;
  margin-bottom: 1rem;
  overflow: hidden;
  border-radius: 0.75rem;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(16, 185, 129, 0.1);
  padding: 0.5rem;
  transition: all 0.3s ease;
}

.ticker-image-container:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1), 0 0 0 2px rgba(16, 185, 129, 0.2);
}

.ticker-gradient-left {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 8rem;
  background: linear-gradient(to right, rgba(240, 253, 244, 1), transparent);
  z-index: 10;
  pointer-events: none;
}

.ticker-gradient-right {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 8rem;
  background: linear-gradient(to left, rgba(240, 253, 244, 1), transparent);
  z-index: 10;
  pointer-events: none;
}

@media (max-width: 768px) {
  .ticker-wrapper {
    animation: scroll 45s linear infinite;
  }
  
  .ticker-image-container {
    width: 8rem;
    height: 8rem;
  }
  
  .ticker-item {
    margin: 0 1.5rem;
    min-width: 12rem;
    max-width: 16rem;
  }
}

@media (max-width: 640px) {
  .ticker-wrapper {
    animation: scroll 35s linear infinite;
  }
  
  .ticker-image-container {
    width: 7rem;
    height: 7rem;
  }
  
  .ticker-item {
    margin: 0 1rem;
    min-width: 9rem;
    max-width: 12rem;
  }
}
`;

// Data mitra
const mitraList = [
	{
		name: 'PT Kebun Bumi Lestari (KBL)',
		logo: '/image/mitra/thefamili.webp',
		url: '#',
	},
	{
		name: 'Adhiguna Samasta Harsa (ASH)',
		logo: '/image/mitra/adhiguna.webp',
		url: '#',
	},
	{
		name: 'Greenhouse Solution Indonesia (GSI)',
		logo: '/image/mitra/gsiLogo.webp',
		url: '#',
	},
	{
		name: 'PT MEDION',
		logo: '/image/mitra/medion.webp',
		url: '#',
	},
	{
		name: 'KARYA BERSAMA',
		logo: '/image/placeholder.webp',
		url: '#',
	},
	{
		name: 'DINAS PERTANIAN',
		logo: '/image/mitra/dinaspertaniantanahdatar.webp',
		url: '#',
	},
	{
		name: 'POLITANI PAYAKUMBUH',
		logo: '/image/mitra/poltanipyk.webp',
		url: '#',
	},
	{
		name: 'Politeknik Negeri Padang (PNP)',
		logo: '/image/mitra/pnp.webp',
		url: '#',
	},
	{
		name: 'Pemerintah Kabupaten Tanah Datar',
		logo: '/image/mitra/pemkabtd.webp',
		url: '#',
	},
	{
		name: 'Pemerintah Provinsi Sumatera Barat',
		logo: '/image/mitra/pemprovsumbar.webp',
		url: '#',
	},
	{
		name: 'SMK MOENADI Ungaran',
		logo: '/image/mitra/smknhmoenadiunggaran.webp',
		url: '#',
	},
];

const Mitras = () => {
	const { ref, inView } = useInView({
		threshold: 0.1,
		triggerOnce: true,
	});
	
	// State to handle image loading errors
	const [imageError, setImageError] = useState<Record<string, boolean>>({});
	
	// State to control animation pause on hover
	const [isHovered, setIsHovered] = useState(false);

	return (
		<section
			id="mitra"
			className="py-24 bg-white relative overflow-hidden"
			ref={ref}
		>
			{/* Inject CSS */}
			<style jsx global>{tickerStyles}</style>
			
			{/* Background decorative elements */}
			<div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-gray-50 to-transparent" />
			<div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-gray-50/50 to-transparent" />

			<div className="absolute -bottom-16 -right-16 w-64 h-64 bg-emerald-800/5 rounded-full blur-3xl" />
			<div className="absolute -top-16 -left-16 w-64 h-64 bg-emerald-600/5 rounded-full blur-3xl" />

			{/* Pattern overlay */}
			<div className="absolute inset-0 opacity-5 pointer-events-none">
				<div
					className="h-full w-full bg-repeat"
					style={{
						backgroundImage:
							'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23015e23\' fill-opacity=\'0.2\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
					}}
				/>
			</div>

			<div className="container mx-auto px-4 relative z-10">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: inView ? 1 : 0, y: inView ? 0 : 20 }}
					transition={{ duration: 0.6 }}
					className="text-center mb-16"
				>
					<div className="inline-flex items-center justify-center gap-3 bg-emerald-800/10 px-4 py-1.5 rounded-full text-emerald-800 font-medium text-sm mb-4">
						<Handshake size={18} />
						<span>Kolaborasi Industri</span>
					</div>

					<h2 className="text-3xl md:text-4xl font-bold text-emerald-800 mb-4">
						Mitra Kerja Sama
					</h2>
					<p className="text-gray-600 max-w-3xl mx-auto">
						Kami berkolaborasi dengan berbagai institusi dan perusahaan untuk
						memastikan program TEFA kami relevan dan berkualitas tinggi, memberikan
						pengalaman pembelajaran terbaik bagi siswa.
					</p>
				</motion.div>

				{/* Ticker Tape Animation for Partners */}
				<div className="mb-20">
					{/* Create a container with overflow hidden */}
					<div 
						className="ticker-container"
						onMouseEnter={() => setIsHovered(true)}
						onMouseLeave={() => setIsHovered(false)}
					>
						{/* Add gradient masks for smooth fade effect */}
						<div className="ticker-gradient-left"></div>
						<div className="ticker-gradient-right"></div>

						{/* The ticker container */}
						<div 
							className="ticker-wrapper"
							style={{
								animationPlayState: isHovered ? 'paused' : 'running'
							}}
						>
							{/* First set of items */}
							{mitraList.map((mitra, index) => (
								<div 
									key={`ticker-item-1-${index}`} 
									className="ticker-item"
								>
									<div className="ticker-image-container">
										{!imageError[mitra.name] ? (
											<Image
												src={mitra.logo}
												alt={mitra.name}
												fill
												className="object-contain p-2"
												onError={() => setImageError(prev => ({ 
													...prev, 
													[mitra.name]: true 
												}))}
											/>
										) : (
											<div className="flex items-center justify-center h-full w-full bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg">
												<div className="text-center p-2">
													<Building2 className="mx-auto h-12 w-12 text-emerald-600/70 mb-2" />
													<div className="bg-emerald-600/10 px-3 py-1.5 rounded-full">
														<span className="text-emerald-700 text-xl font-bold">
															{mitra.name.split(' ').map(word => word.charAt(0)).join('')}
														</span>
													</div>
												</div>
											</div>
										)}
									</div>
									
									<span className="text-base font-medium text-gray-800 text-center px-2 whitespace-normal" style={{ width: 'auto', minWidth: '10rem', maxWidth: '14rem' }}>
										{mitra.name}
									</span>
								</div>
							))}
							
							{/* Duplicated set for seamless looping */}
							{mitraList.map((mitra, index) => (
								<div 
									key={`ticker-item-2-${index}`} 
									className="ticker-item"
								>
									<div className="ticker-image-container">
										{!imageError[mitra.name] ? (
											<Image
												src={mitra.logo}
												alt={mitra.name}
												fill
												className="object-contain p-2"
												onError={() => setImageError(prev => ({ 
													...prev, 
													[mitra.name]: true 
												}))}
											/>
										) : (
											<div className="flex items-center justify-center h-full w-full bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg">
												<div className="text-center p-2">
													<Building2 className="mx-auto h-12 w-12 text-emerald-600/70 mb-2" />
													<div className="bg-emerald-600/10 px-3 py-1.5 rounded-full">
														<span className="text-emerald-700 text-xl font-bold">
															{mitra.name.split(' ').map(word => word.charAt(0)).join('')}
														</span>
													</div>
												</div>
											</div>
										)}
									</div>
									
									<span className="text-base font-medium text-gray-800 text-center px-2 whitespace-normal" style={{ width: 'auto', minWidth: '10rem', maxWidth: '14rem' }}>
										{mitra.name}
									</span>
								</div>
							))}
						</div>
						
						{/* Hover instruction */}
						<div className="absolute bottom-2 right-4 text-xs text-emerald-700/80 italic bg-white/60 px-2 py-1 rounded-md backdrop-blur-sm">
							*Arahkan kursor untuk menghentikan animasi
						</div>
					</div>
				</div>

				{/* Description */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: inView ? 1 : 0, y: inView ? 0 : 20 }}
					transition={{ duration: 0.6, delay: 0.5 }}
					className="max-w-2xl mx-auto text-center"
				>
					<p className="text-gray-600 text-sm">
						Kemitraan kami membangun jembatan antara pendidikan dan industri, 
						memberikan siswa kami pengalaman langsung dan relevan dengan dunia kerja.
					</p>
				</motion.div>
			</div>
		</section>
	);
};

export default Mitras;