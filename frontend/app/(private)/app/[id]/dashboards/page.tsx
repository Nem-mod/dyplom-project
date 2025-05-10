'use client';

import { useEffect, useState } from 'react';
import {
	Button,
	Card,
	CardBody,
	CardHeader,
	CardFooter,
	Input,
	useDisclosure,
	Modal,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalFooter,
	Textarea,
	addToast,
} from '@heroui/react';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { IDashboard } from '@/types/dashboard';
import { AUTH_TOKEN, WEBSERVER_URL } from '@/consts/server';

async function loadDashboards(): Promise<IDashboard[]> {
	const res = await fetch(`${WEBSERVER_URL}/dashboards`, {
		headers: {
			Authorization: AUTH_TOKEN,
		},
	});
	const data: IDashboard[] = await res.json();
	return data;
}

export default function DashboardsPage() {
	const [dashboards, setDashboards] = useState<IDashboard[]>();
	const [title, setTitle] = useState('');
	const [description, setDescription] = useState('');
	const { isOpen, onOpen, onOpenChange } = useDisclosure();
	useEffect(() => {
		loadDashboards()
			.then(setDashboards)
			.catch(() => addToast({ title: 'Не вдалося завантажити дошки' }));
	}, []);
	const handleCreate = async (onClose: () => void) => {
		if (!title.trim()) {
			addToast({ title: 'Назва обов’язкова' });
			return;
		}

		try {
			const res = await fetch(`${WEBSERVER_URL}/dashboards`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: AUTH_TOKEN,
				},
				body: JSON.stringify({
					name: title,
					description: description,
					workspaceId: 1,
				}),
			});

			if (!res.ok) throw new Error();

			const newBoard: IDashboard = await res.json();

			setDashboards((prev) => [...(prev || []), newBoard]);
			addToast({ title: 'Дошку створено', description: newBoard.name });
			setTitle('');
			setDescription('');
			onClose();
		} catch (error) {
			addToast({
				title: 'Помилка створення',
				description: 'Спробуйте ще раз пізніше.',
			});
		}
	};

	const handleDashboardDelete = async (dashboard: IDashboard) => {
		if (!dashboard?.id) return;
		try {
			const res = await fetch(`${WEBSERVER_URL}/dashboards/${dashboard.id}`, {
				method: 'DELETE',
				headers: {
					Authorization: AUTH_TOKEN,
				},
			});

			if (!res.ok) throw new Error();

			addToast({
				title: 'Дешборд видалено',
				description: 'Аналітичну дошку успішно видалено.',
			});
			window.location.href = '/app/1/dashboards';
		} catch (error) {
			addToast({
				title: 'Помилка видалення',
				description: 'Не вдалося видалити дошку.',
			});
		}
	};

	return (
		<div className='mt-16 px-6'>
			<div className='flex items-center justify-between mb-6'>
				<h1 className='text-2xl font-bold'>Аналітичні дошки</h1>
				<Button
					startContent={<Plus size={18} />}
					onPress={onOpen}
					color='primary'
				>
					Створити дошку
				</Button>
			</div>

			<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
				{dashboards &&
					dashboards.map((board) => (
						<Card
							as={Link}
							href={`/app/1/dashboards/${board.id}`}
							key={board.id}
							className='flex flex-col h-full'
						>
							<CardHeader className='font-semibold text-lg'>
								{board.name}
							</CardHeader>
							<CardBody>
								{board.description}
							</CardBody>
							<CardFooter className='flex justify-end gap-2'>
								<Button
									color='danger'
									variant='light'
									onPress={() => handleDashboardDelete(board)}
								>
									Видалити дошку
								</Button>
							</CardFooter>
						</Card>
					))}
			</div>

			{/* Modal: Create Dashboard */}
			<Modal isOpen={isOpen} onOpenChange={onOpenChange}>
				<ModalContent>
					{(onClose) => (
						<>
							<ModalHeader>Створити аналітичну дошку</ModalHeader>
							<ModalBody>
								<Input
									label='Назва'
									placeholder='Напр. Продажі'
									value={title}
									onChange={(e) => setTitle(e.target.value)}
								/>
								<Textarea
									label='Опис (необов’язково)'
									placeholder='Що показує ця дошка'
									value={description}
									onChange={(e) => setDescription(e.target.value)}
								/>
							</ModalBody>
							<ModalFooter>
								<Button variant='light' onPress={onClose}>
									Скасувати
								</Button>
								<Button color='primary' onPress={() => handleCreate(onClose)}>
									Створити
								</Button>
							</ModalFooter>
						</>
					)}
				</ModalContent>
			</Modal>
		</div>
	);
}
