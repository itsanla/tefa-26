'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Award, BookOpen, Users, Calendar, Target, GraduationCap, Leaf, X } from 'lucide-react';

const infoTabs = [
	{
		id: 'visi',
		title: 'Visi Kami',
		description:
			'Berakhlak Mulia, Berilmu pengetahuan, Berteknologi, Kompetitif dengan Jiwa Entrepreuneur Millenial yang Unggul Dan Berwawasan Global',
		icon: <Target className="h-12 w-12 text-school-accent" />,
	},
	{
		id: 'misi',
		title: 'Misi Kami',    
		icon: <Leaf className="h-12 w-12 text-school-accent" />,
		points: [
			'Melaksanakan pembelajaran berdiferensiasi, deeplearning dan berpusat kepada peserta didik dengan kompetensi social emosional',
			'Melaksanakan pembelajaran melalui kegiatan ekstrakurikuler dan kokurikuler projek penguatan pembelajaran pancasila',
			'Menciptakan generasi yang mampu menjawab tantangan berbagai hal terkait ilmu pengetahuan dan teknologi',
			'Membina generasi agar mampu menjadi seorang yang aktif berbicara, jujur dan disiplin',
			'Menciptakan sekolah sehat dan ramah anak',
			'Mewujudkan Pembelajaran berbasis Teaching Factory (Tefa) di bidang agribisnis pertanian modern dan teknologi dibidang lainnya serta industry kreatif',
			'Menyiapkan lulusan yang kompetitif dan professional dengan Sertifikat Kompetensi yang dibutuhkan oleh DUDIKA di bidang agribisnis dan teknologi serta industry kreatif',
			'Menghasilkan lulusan yang tangguh, inovatif dan berjiwa entrepreneur terkini di bidang agribisnis dan teknologi serta industry kreatif',
			'Mengisi quota mahasiswa di berbagai perguruan tinggi',
		],
	},
];

const detailsContent = {
	prestasi: (
		<div>
			<h3 className="text-xl font-bold mb-4 text-school-primary">Prestasi SMK Negeri 2 Batusangkar</h3>
			<p className="text-gray-600 mb-4">
				Prestasi siswa SMK Negeri 2 Batusangkar cukup membanggakan, baik tingkat Kabupaten, Provinsi, maupun Nasional:
			</p>
			<div className="space-y-4">
				<div className="bg-school-primary/5 p-4 rounded-lg border border-school-primary/20">
					<div className="flex items-center gap-2 mb-2">
						<div className="w-3 h-3 rounded-full bg-school-accent"></div>
						<h4 className="font-medium text-school-primary">Juara I LKS tingkat Provinsi</h4>
					</div>
				</div>
				<div className="bg-school-primary/5 p-4 rounded-lg border border-school-primary/20">
					<div className="flex items-center gap-2 mb-2">
						<div className="w-3 h-3 rounded-full bg-school-accent"></div>
						<h4 className="font-medium text-school-primary">Juara Harapan I LKS tingkat Nasional</h4>
					</div>
				</div>
				<div className="bg-school-primary/5 p-4 rounded-lg border border-school-primary/20">
					<div className="flex items-center gap-2 mb-2">
						<div className="w-3 h-3 rounded-full bg-school-accent"></div>
						<h4 className="font-medium text-school-primary">Juara I dan II Lomba Karya Ilmiah Siswa tingkat Kabupaten dan Provinsi</h4>
					</div>
				</div>
			</div>
		</div>
	),
	tefa: (
		<div>
			<h3 className="text-xl font-bold mb-4 text-school-primary">Program Unggulan TEFA</h3>
			<p className="text-gray-600 mb-4">
				Teaching Factory (TEFA) adalah program unggulan yang mendukung pembelajaran berbasis produksi dan jasa sesuai dengan kompetensi keahlian yang dimiliki.
			</p>
			<div className="space-y-4">
				<div className="bg-school-primary/5 p-4 rounded-lg border border-school-primary/20">
					<h4 className="font-medium text-school-primary mb-2">Implementasi TEFA di SMK Negeri 2 Batusangkar:</h4>
					<ul className="list-disc list-inside space-y-2 text-gray-600">
						<li>Budidaya melon hidroponik dengan berbagai varietas</li>
						<li>Pengolahan hasil pertanian menjadi produk bernilai tambah</li>
						<li>Praktik servis kendaraan bermotor</li>
						<li>Program kewirausahaan yang terintegrasi dengan kurikulum</li>
					</ul>
				</div>
			</div>
		</div>
	),
	pengajar: (
		<div>
			<h3 className="text-xl font-bold mb-4 text-school-primary">Tenaga Pengajar</h3>
			<p className="text-gray-600 mb-4">
				SMK Negeri 2 Batusangkar didukung oleh tenaga pengajar berkualitas dari berbagai bidang keahlian.
			</p>
			
			<div className="overflow-x-auto mb-6">
				<table className="w-full border-collapse">
					<thead>
						<tr className="bg-school-primary text-white">
							<th className="border border-school-primary/30 px-4 py-2 text-left">Jenis Guru</th>
							<th className="border border-school-primary/30 px-4 py-2 text-center">Jumlah</th>
						</tr>
					</thead>
					<tbody>
						<tr className="even:bg-school-primary/5">
							<td className="border border-school-primary/20 px-4 py-2">Guru Mata Pelajaran Umum</td>
							<td className="border border-school-primary/20 px-4 py-2 text-center">15</td>
						</tr>
						<tr className="even:bg-school-primary/5">
							<td className="border border-school-primary/20 px-4 py-2">Guru Mata Pelajaran Kejuruan</td>
							<td className="border border-school-primary/20 px-4 py-2 text-center">11</td>
						</tr>
						<tr className="even:bg-school-primary/5">
							<td className="border border-school-primary/20 px-4 py-2">Guru BK / BK TIK</td>
							<td className="border border-school-primary/20 px-4 py-2 text-center">1</td>
						</tr>
						<tr className="bg-school-primary/10 font-semibold">
							<td className="border border-school-primary/20 px-4 py-2">Total</td>
							<td className="border border-school-primary/20 px-4 py-2 text-center">27</td>
						</tr>
					</tbody>
				</table>
			</div>

			<h4 className="font-semibold text-lg text-school-primary mb-3">Kualifikasi Guru Kejuruan:</h4>
			
			<div className="space-y-6">
				<div className="bg-school-primary/5 p-4 rounded-lg border border-school-primary/20">
					<h5 className="font-medium text-school-primary mb-3 flex items-center">
						<span className="inline-block w-5 h-5 bg-blue-500 rounded-full mr-2"></span>
						Teknik Otomotif:
					</h5>
					<ul className="list-disc list-inside space-y-1 pl-4 text-gray-600">
						<li>Guru A: S1 Teknik Mesin</li>
						<li>Guru B: S1 Pendidikan Teknik Otomotif</li>
						<li>Guru C: D3 Teknik Otomotif</li>
						<li>Guru D: S1 Teknik Mesin</li>
						<li>Guru E: S1 Pendidikan Teknik Mesin</li>
					</ul>
				</div>
				
				<div className="bg-school-primary/5 p-4 rounded-lg border border-school-primary/20">
					<h5 className="font-medium text-school-primary mb-3 flex items-center">
						<span className="inline-block w-5 h-5 bg-green-500 rounded-full mr-2"></span>
						Agribisnis Tanaman:
					</h5>
					<ul className="list-disc list-inside space-y-1 pl-4 text-gray-600">
						<li>Guru A: S1 Pertanian</li>
						<li>Guru B: S1 Agronomi</li>
						<li>Guru C: S1 Agroteknologi</li>
					</ul>
				</div>
				
				<div className="bg-school-primary/5 p-4 rounded-lg border border-school-primary/20">
					<h5 className="font-medium text-school-primary mb-3 flex items-center">
						<span className="inline-block w-5 h-5 bg-orange-500 rounded-full mr-2"></span>
						Agribisnis Pengolahan Hasil Pertanian:
					</h5>
					<ul className="list-disc list-inside space-y-1 pl-4 text-gray-600">
						<li>Guru A: S1 Teknologi Pangan</li>
						<li>Guru B: S1 Teknologi Hasil Pertanian</li>
						<li>Guru C: S1 Pendidikan Teknologi Pertanian</li>
					</ul>
				</div>
			</div>
			
		</div>
	)
};

const infoCards = [
	{
		id: 'prestasi',
		title: 'Prestasi Kami',
		description: 'Prestasi membanggakan: Juara I LKS tingkat Provinsi, Juara Harapan I tingkat Nasional, serta Juara I dan II Lomba Karya Ilmiah Siswa.',
		icon: <Award className="h-8 w-8 text-school-accent" />,
	},
	{
		id: 'tefa',
		title: 'Program Unggulan TEFA',
		description: 'Program Teaching Factory (TEFA) dengan fokus pada budidaya melon hidroponik, pengolahan hasil pertanian, dan servis kendaraan.',
		icon: <BookOpen className="h-8 w-8 text-school-accent" />,
	},
	{
		id: 'pengajar',
		title: 'Tenaga Pengajar',
		description: '27 tenaga pendidik berkualifikasi yang terdiri dari 15 guru umum, 11 guru kejuruan, dan 1 guru BK/TIK dengan latar belakang pendidikan relevan.',
		icon: <Users className="h-8 w-8 text-school-accent" />,
	},
];

// CSS for animation - this will be applied to the element with animate-fadeIn class
const modalAnimation = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fadeIn {
    animation: fadeIn 0.3s ease-out forwards;
  }
`;

const InfoSekolah = () => {
	const [activeTab, setActiveTab] = useState('visi');
	const [activeModal, setActiveModal] = useState<string | null>(null);

	const openModal = (id: string) => {
		setActiveModal(id);
		document.body.style.overflow = 'hidden';
	};

	const closeModal = () => {
		setActiveModal(null);
		document.body.style.overflow = 'auto';
	};

	// Handle escape key to close modal
	useEffect(() => {
		if (typeof window !== 'undefined') {
			const handleKeyDown = (e: KeyboardEvent) => {
				if (e.key === 'Escape' && activeModal) {
					closeModal();
				}
			};

			window.addEventListener('keydown', handleKeyDown);
			return () => window.removeEventListener('keydown', handleKeyDown);
		}
	}, [activeModal]);

	const { ref, inView } = useInView({
		threshold: 0.1,
		triggerOnce: true,
	});

	return (
		<section id="info" className="py-24 bg-gray-50 relative overflow-hidden">
			{/* Add animation styles */}
			<style jsx global>{`
				@keyframes fadeIn {
					from { opacity: 0; transform: translateY(10px); }
					to { opacity: 1; transform: translateY(0); }
				}
				.animate-fadeIn {
					animation: fadeIn 0.3s ease-out forwards;
				}
			`}</style>
			
			{/* Decorative background elements */}
			<div className="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-green-100/50 blur-3xl" />
			<div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-school-primary/10 blur-3xl" />

			{/* Abstract plant-like shapes */}
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 0.15 }}
				transition={{ duration: 1 }}
				className="absolute top-10 right-10 text-school-primary opacity-10"
			>
				<svg
					width="120"
					height="120"
					viewBox="0 0 24 24"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						d="M12 2L14 6.5H10L12 2Z"
						fill="currentColor"
						stroke="currentColor"
						strokeWidth="1"
					/>
					<path
						d="M12 22V8M8 9L12 13M16 9L12 13"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
					/>
					<path
						d="M5 14C8 14 8 18 8 18C8 18 8 14 11 14"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
					/>
					<path
						d="M19 14C16 14 16 18 16 18C16 18 16 14 13 14"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
					/>
				</svg>
			</motion.div>

			<div className="container mx-auto" ref={ref}>
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: inView ? 1 : 0, y: inView ? 0 : 20 }}
					transition={{ duration: 0.6 }}
					className="text-center mb-12"
				>
					<h2 className="text-3xl md:text-4xl font-bold text-school-primary mb-4">
						Informasi Sekolah
					</h2>
					<p className="text-gray-600 max-w-2xl mx-auto">
						Mengenal lebih dekat dengan SMK Negeri 2 Batusangkar dan komitmen kami untuk
						mengembangkan pendidikan vokasi berkualitas tinggi di bidang pertanian.
					</p>
				</motion.div>

				{/* Visi & Misi Section with tabs */}
				<motion.div
					initial={{ opacity: 0, y: 30 }}
					animate={{ opacity: inView ? 1 : 0, y: inView ? 0 : 30 }}
					transition={{ duration: 0.6, delay: 0.2 }}
					className="bg-white rounded-2xl shadow-xl overflow-hidden mb-16 max-w-4xl mx-auto border border-gray-100"
				>
					<div className="flex flex-wrap sm:flex-nowrap border-b border-gray-200">
						{infoTabs.map((tab) => (
							<button
								key={tab.id}
								onClick={() => setActiveTab(tab.id)}
								className={`flex-1 py-4 px-6 text-center font-medium text-lg transition-colors duration-300 ${
									activeTab === tab.id
										? 'bg-white text-school-primary border-b-2 border-school-accent'
										: 'bg-gray-50 text-gray-500 hover:bg-gray-100'
								}`}
							>
								<div className="flex items-center justify-center gap-2">
									<div className="hidden sm:block">{tab.id === 'visi' ? <Target size={18} /> : <Leaf size={18} />}</div>
									{tab.title}
								</div>
							</button>
						))}
					</div>

					<div className="p-6 md:p-8">
						{infoTabs.map((tab) => (
							<div
								key={tab.id}
								className={`${activeTab === tab.id ? 'block' : 'hidden'}`}
							>
								<div className="flex flex-col md:flex-row md:items-start gap-6">
									<div className="flex-shrink-0 p-4 bg-school-primary/10 rounded-full mx-auto md:mx-0 mb-4 md:mb-0">
										{tab.icon}
									</div>
									<div>
										{tab.description && (
											<div className="p-4 bg-school-primary/5 rounded-lg border border-school-primary/10 mb-6">
												<h3 className="text-xl font-semibold text-school-primary mb-2">Visi SMK Negeri 2 Batusangkar</h3>
												<p className="text-gray-700 leading-relaxed italic">
													"{tab.description}"
												</p>
											</div>
										)}

										{tab.points && (
											<>
												<h3 className="text-xl font-semibold text-school-primary mb-4">Misi SMK Negeri 2 Batusangkar</h3>
												<div className="grid grid-cols-1 gap-y-4">
													{tab.points.map((point, idx) => (
														<motion.div
															key={idx}
															initial={{ opacity: 0, x: -10 }}
															animate={{ opacity: 1, x: 0 }}
															transition={{ delay: idx * 0.1, duration: 0.4 }}
															className="flex items-start gap-3 bg-white p-3 rounded-lg hover:bg-school-primary/5 transition-colors border border-gray-100"
														>
															<div className="mt-1 flex-shrink-0 bg-school-accent rounded-full p-1">
																<div className="h-1.5 w-1.5 rounded-full bg-white"></div>
															</div>
															<div className="flex items-center">
																<div className="text-school-primary font-semibold mr-2">{idx + 1}.</div>
																<p className="text-gray-700">{point}</p>
															</div>
														</motion.div>
													))}
												</div>
											</>
										)}
									</div>
								</div>
							</div>
						))}
					</div>
				</motion.div>

				{/* Info cards */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
					{infoCards.map((item, index) => (
						<motion.div
							key={index}
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: inView ? 1 : 0, y: inView ? 0 : 20 }}
							transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
							className="group relative overflow-hidden bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
						>
							{/* Card decoration */}
							<div className="absolute w-32 h-32 -top-10 -right-10 bg-school-primary/5 group-hover:bg-school-primary/10 transition-colors rounded-full" />
							<div className="absolute w-20 h-20 -bottom-6 -left-6 bg-green-100 rounded-full" />

							<div className="p-6 relative z-10 h-full flex flex-col">
								<div className="flex items-center justify-center mb-5">
									<div className="p-4 bg-school-primary/10 rounded-full group-hover:bg-school-primary/20 transition-colors">
										{item.icon}
									</div>
								</div>
								<h3 className="text-xl font-semibold text-school-primary mb-3 text-center">
									{item.title}
								</h3>
								<p className="text-gray-600 text-center flex-grow">
									{item.description}
								</p>
								
								<button 
									onClick={() => openModal(item.id)}
									className="mt-6 flex justify-center items-center text-white bg-school-accent hover:bg-school-primary rounded-lg py-2 text-sm font-medium transition-colors w-full"
								>
									<span className="flex items-center">
										Lihat Detail
										<svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
										</svg>
									</span>
								</button>
							</div>

							{/* Hover accent border */}
							<div className="absolute bottom-0 left-0 right-0 h-1 bg-school-accent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
						</motion.div>
					))}
				</div>

				{/* Modal */}
				{activeModal && (
					<div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
						<div 
							className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto animate-fadeIn border border-school-primary/10"
							onClick={(e) => e.stopPropagation()}
						>
							<div className="flex justify-between items-center border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-school-primary to-school-accent/80">
								<h3 className="font-bold text-lg sm:text-xl text-white truncate mr-4">
									{infoCards.find(card => card.id === activeModal)?.title}
								</h3>
								<button 
									onClick={closeModal}
									className="p-1.5 sm:p-1 rounded-full hover:bg-white/20 transition-colors flex-shrink-0"
								>
									<X className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
								</button>
							</div>
							
							<div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(95vh-120px)] sm:max-h-[calc(90vh-140px)]">
								{activeModal === 'prestasi' && detailsContent.prestasi}
								{activeModal === 'tefa' && detailsContent.tefa}
								{activeModal === 'pengajar' && detailsContent.pengajar}
							</div>
							
							<div className="border-t border-gray-200 p-3 sm:p-4 bg-gray-50 flex justify-end sticky bottom-0">
								<button 
									onClick={closeModal}
									className="px-4 sm:px-6 py-2 sm:py-2.5 bg-school-accent hover:bg-school-primary text-white rounded-md transition-colors text-sm font-medium shadow-sm min-w-[80px]"
								>
									Tutup
								</button>
							</div>
						</div>
					</div>
				)}
			</div>
		</section>
	);
};

export default InfoSekolah;