'use client';

import { useState } from 'react';
import {
	Table,
	TableHeader,
	TableBody,
	TableColumn,
	TableRow,
	TableCell,
	Button,
	Avatar,
	Chip,
	Modal,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalFooter,
	Input,
	useDisclosure,
	addToast,
	Dropdown,
	DropdownItem,
	DropdownMenu,
	DropdownTrigger,
	Checkbox,
} from '@heroui/react';
import {
	UserPlus,
	MoreVertical,
	MailCheck,
	AlertTriangle,
	PlusSquare,
	Edit3,
	Trash2,
} from 'lucide-react';

interface IUser {
	id: number;
	name: string;
	email: string;
	role: 'member' | 'admin';
	status: 'pending' | 'active';
}
export default function WorkspaceUsersPage() {
	const MOCK_USERS = [
		{
			id: 1,
			name: 'Олена Іваненко',
			email: 'olena@example.com',
			role: 'admin',
			status: 'active',
		},
		{
			id: 2,
			name: 'Ігор Петренко',
			email: 'ihor@example.com',
			role: 'member',
			status: 'pending',
		},
		{
			id: 3,
			name: 'Марія Коваль',
			email: 'maria@example.com',
			role: 'member',
			status: 'active',
		},
	];

	const MOCK_KNOWN_EMAILS = [
		'nechamdod@gmail.com',
		'ihor@example.com',
		'maria@example.com',
		'newuser@example.com',
	];

	const [users, setUsers] = useState(MOCK_USERS);
	const [email, setEmail] = useState('');
	const { isOpen, onOpen, onOpenChange } = useDisclosure();

	const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
	const [accessRights, setAccessRights] = useState<string[]>([]);
	const {
		isOpen: isAccessModalOpen,
		onOpen: openAccessModal,
		onOpenChange: onAccessModalChange,
	} = useDisclosure();

	const accessOptions = [
		{
			key: 'create',
			label: 'Створення аналітичних дошок',
			icon: <PlusSquare size={16} />,
		},
		{
			key: 'edit',
			label: 'Редагування аналітичних дошок',
			icon: <Edit3 size={16} />,
		},
		{
			key: 'delete',
			label: 'Видалення аналітичних дошок',
			icon: <Trash2 size={16} />,
		},
	];

	const openAccessEditor = (user: IUser) => {
		setSelectedUser(user);
		setAccessRights(['create']); // Початкові права
		openAccessModal();
	};

	const handleInvite = (onClose: () => void) => {
		const normalizedEmail = email.trim().toLowerCase();

		if (!normalizedEmail.includes('@')) {
			addToast({
				title: 'Некоректний email',
				description: 'Будь ласка, введіть дійсну електронну адресу.',
				icon: <AlertTriangle className='text-warning' size={20} />,
			});
			return;
		}

		if (MOCK_KNOWN_EMAILS.includes(normalizedEmail)) {
			addToast({
				title: 'Запрошення надіслано',
				description: `Користувача ${normalizedEmail} запрошено`,
				icon: <MailCheck className='text-success' size={20} />,
				timeout: 3000,
				shouldShowTimeoutProgress: true,
			});
			setEmail('');
			onClose();
		} else {
			addToast({
				title: 'Користувача не знайдено',
				description: `Email ${normalizedEmail} не зареєстрований`,
				icon: <AlertTriangle className='text-danger' size={20} />,
			});
		}
	};

	return (
		<div className='mt-16 px-6'>
			<div className='flex items-center justify-between mb-6'>
				<h1 className='text-2xl font-bold'>Користувачі робочого простору</h1>
				<Button
					color='primary'
					startContent={<UserPlus size={18} />}
					onPress={onOpen}
				>
					Додати користувача
				</Button>
			</div>

			<Table aria-label='Список користувачів'>
				<TableHeader>
					<TableColumn>Ім’я</TableColumn>
					<TableColumn>Пошта</TableColumn>
					<TableColumn>Роль</TableColumn>
					<TableColumn>Статус</TableColumn>
					<TableColumn className='text-right'>Дії</TableColumn>
				</TableHeader>
				<TableBody>
					{users.map((user) => (
						<TableRow key={user.id}>
							<TableCell>
								<div className='flex items-center gap-3'>
									<Avatar name={user.name} size='sm' />
									{user.name}
								</div>
							</TableCell>
							<TableCell>{user.email}</TableCell>
							<TableCell>
								<Chip
									color={user.role === 'admin' ? 'primary' : 'default'}
									variant='flat'
								>
									{user.role}
								</Chip>
							</TableCell>
							<TableCell>
								<Chip
									color={user.status === 'active' ? 'success' : 'warning'}
									variant='flat'
								>
									{user.status}
								</Chip>
							</TableCell>
							<TableCell className='text-right'>
								<Dropdown>
									<DropdownTrigger>
										<Button isIconOnly variant='light' size='sm'>
											<MoreVertical size={16} />
										</Button>
									</DropdownTrigger>
									<DropdownMenu
										aria-label='User Actions'
										onAction={(key) => {
											if (key === 'edit') openAccessEditor(user as IUser);
											if (key === 'delete') {
												setUsers((prev) =>
													prev.filter((u) => u.id !== user.id)
												);
											}
										}}
									>
										<DropdownItem key='edit'>Редагувати доступ</DropdownItem>
										<DropdownItem
											key='delete'
											className='text-danger'
											color='danger'
										>
											Видалити користувача
										</DropdownItem>
									</DropdownMenu>
								</Dropdown>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>

			{/* Invite Modal */}
			<Modal isOpen={isOpen} onOpenChange={onOpenChange}>
				<ModalContent>
					{(onClose) => (
						<>
							<ModalHeader className='flex flex-col gap-1'>
								Запросити користувача
							</ModalHeader>
							<ModalBody>
								<Input
									type='email'
									label='Електронна пошта'
									placeholder='user@example.com'
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									isRequired
								/>
							</ModalBody>
							<ModalFooter>
								<Button color='danger' variant='light' onPress={onClose}>
									Скасувати
								</Button>
								<Button color='primary' onPress={() => handleInvite(onClose)}>
									Надіслати запрошення
								</Button>
							</ModalFooter>
						</>
					)}
				</ModalContent>
			</Modal>

			{/* Access Edit Modal */}
			<Modal isOpen={isAccessModalOpen} onOpenChange={onAccessModalChange}>
				<ModalContent>
					{(onClose) => (
						<>
							<ModalHeader className='flex flex-col gap-1'>
								Редагування доступів
							</ModalHeader>
							<ModalBody>
								<p className='text-sm text-gray-500 mb-2'>
									Користувач:{' '}
									<span className='font-medium'>{selectedUser?.name}</span>
								</p>
								<div className='space-y-3'>
									{accessOptions.map((option) => (
										<Checkbox
											key={option.key}
											isSelected={accessRights.includes(option.key)}
											onValueChange={(checked) => {
												setAccessRights((prev) =>
													checked
														? [...prev, option.key]
														: prev.filter((k) => k !== option.key)
												);
											}}
										>
											<div className='flex items-center gap-2'>
												{option.icon}
												{option.label}
											</div>
										</Checkbox>
									))}
								</div>
							</ModalBody>
							<ModalFooter>
								<Button variant='light' onPress={onClose}>
									Скасувати
								</Button>
								<Button
									color='primary'
									onPress={() => {
										addToast({
											title: 'Права доступу оновлено',
											description: `Для ${selectedUser?.name}`,
										});
										onClose();
									}}
								>
									Зберегти
								</Button>
							</ModalFooter>
						</>
					)}
				</ModalContent>
			</Modal>
		</div>
	);
}
