'use client';

import React from 'react';
import { Avatar } from '@heroui/react';
import {
	Dropdown,
	DropdownTrigger,
	DropdownMenu,
	DropdownItem,
} from '@heroui/dropdown';
import { CirclePlus, Folder, Home, Plus, Settings, User } from 'lucide-react';
import Link from 'next/link';

interface IProps {
	className?: string;
}

const workspaces = [
	{ key: 'team1', label: 'Маркетинг' },
	{ key: 'team2', label: 'Розробка' },
	{ key: 'team3', label: 'Аналітика' },
];

export default function Sidebar({ className }: IProps) {
	return (
		<div
			className={`w-full max-w-[260px] h-full flex flex-col relative bg-primary-100 text-white px-4 py-6 ${className}`}
		>
			<h1 className='text-2xl font-bold mb-10'>Eventalytica</h1>
			{/* Navigation */}
			<nav className='space-y-4 shrink-1 flex-grow '>
				<Link
					href='/app/1/dashboards'
					className='flex items-center gap-3 px-3 py-2 rounded-md hover:bg-primary-200 transition'
				>
					<Home size={20} />
					<span>Dashboard</span>
				</Link>
				<Link
					href='/app/1/users'
					className='flex items-center gap-3 px-3 py-2 rounded-md hover:bg-primary-200 transition'
				>
					<User size={20} />
					<span>Користувачі</span>
				</Link>
				<Link
					href='/app/1/new-workspace'
					className='flex items-center gap-3 px-3 py-2 rounded-md hover:bg-primary-200 transition'
				>
					<CirclePlus size={20} />
					<span>Новий робочий простір</span>
				</Link>
			</nav>
			{/* Workspace selector */}
			<Dropdown classNames={{ content: 'w-full' }}>
				<DropdownTrigger>
					<div className='mx-auto w-full flex items-center gap-3 px-3 py-3 border rounded-lg bg-white text-primary-200 cursor-pointer'>
						<Avatar name='W' isBordered color='primary' radius='sm' />
						<div className='text-base font-medium'>Робочий простір</div>
					</div>
				</DropdownTrigger>
				<DropdownMenu
					aria-label='Workspace selection'
					className=''
					items={workspaces}
				>
					{(item) => (
						<DropdownItem key={item.key} className='w-full'>
							<div className='w-full flex items-center gap-3 text-primary-200 cursor-pointer mb-2'>
								<Avatar
									name={item.label}
									isBordered
									color='primary'
									radius='sm'
								/>
								<div className='text-base font-medium'>{item.label}</div>
							</div>
						</DropdownItem>
					)}
				</DropdownMenu>
			</Dropdown>
		</div>
	);
}
