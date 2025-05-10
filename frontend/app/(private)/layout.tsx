'use client'
import React from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';

export default function PublicLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className='grid grid-cols-12 min-h-screen'>
			<Sidebar className='col-span-2 pt-8 px-6' />
			<main className='col-span-10 mx-auto pt-16 px-6 w-full'>
				{children}
			</main>
		</div>
	);
}
