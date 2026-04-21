'use client';

import { useEffect, useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
    // Handle ESC key to close modal
    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEsc);
        }

        return () => {
            document.removeEventListener('keydown', handleEsc);
        };
    }, [isOpen, onClose]);

    // Handle click outside to close
    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) onClose();
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[9999] bg-[rgba(0,0,0,0.5)] backdrop-blur-sm flex justify-center items-center"
            onClick={handleBackdropClick}
        >
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">Create Komoditas</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white focus:outline-none"
                    >
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>
                <div className="p-4 text-gray-800 dark:text-gray-200">
                    {children}
                </div>
            </div>
        </div>
    );
};


export default function InfoKomoditasForm({ isOpen, onClose, selectedKomoditas }: { isOpen: boolean; onClose: () => void; selectedKomoditas: any }) {
    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="p-4">
                {selectedKomoditas && (
                    <div className="grid grid-cols-2 gap-4 text-gray-900 dark:text-gray-100">
                        <label>Nama Jenis</label>
                        <p className="break-words">{selectedKomoditas.jenis.name}</p>

                        <label>Nama</label>
                        <p className="break-words">{selectedKomoditas.nama}</p>


                        <label>Satuan</label>
                        <p>{selectedKomoditas.satuan}</p>

                        <label>Jumlah</label>
                        <p>{selectedKomoditas.jumlah}</p>
                        
                        <label>Gambar</label>
                        {selectedKomoditas?.foto ? (
                            <img
                                src={selectedKomoditas.foto.startsWith('http') ? 
                                  selectedKomoditas.foto : 
                                  `/image/${selectedKomoditas.foto.replace('/image/', '')}`}
                                alt="Preview Gambar"
                                className="max-h-48 rounded border"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = '/image/placeholder.webp';
                                }}
                            />
                        ) : (
                            <p className="col-span-1">Tidak ada gambar</p>
                        )}

                        <label className="col-span-2">Deskripsi</label>
                        <p className="col-span-2 break-words whitespace-pre-wrap text-justify">
                            {selectedKomoditas.deskripsi}
                        </p>


                        <div className="col-span-2 mt-4 flex justify-end space-x-2">
                            <button
                                type="button"
                                className="px-4 py-2 bg-gray-200 dark:bg-gray-600 dark:text-white text-gray-800 rounded hover:bg-green-300 dark:hover:bg-green-500"
                                onClick={onClose}
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
}
