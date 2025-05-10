'use client';

import { useState, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import {
	ColDef,
	ModuleRegistry,
	ClientSideRowModelModule,
} from 'ag-grid-community';

import { ANALYTICS_URL, AUTH_TOKEN, WEBSERVER_URL } from '@/consts/server';
import {
	Button,
	Drawer,
	DrawerBody,
	DrawerContent,
	DrawerHeader,
	DrawerFooter,
	useDisclosure,
	Textarea,
	Input,
	Tab,
	Tabs,
	Snippet,
	addToast,
} from '@heroui/react';
import { IDashboard } from '@/types/dashboard';
import { useParams } from 'next/navigation';

ModuleRegistry.registerModules([ClientSideRowModelModule]);

type Row = {
	id?: string;
	timestamp?: string;
	[key: string]: any;
};

type IEventData = {
	id: string;
	data: object;
	timestamp: string;
};

async function loadDashboardEvents(
	dashboardIdentifier: string,
	page: number = 1,
	limit: number = 20
) {
	const res = await fetch(
		`${WEBSERVER_URL}/dashboards/events?timescaleIdentifier=${dashboardIdentifier}&page=${page}&limit=${limit}`,
		{
			headers: {
				Authorization: AUTH_TOKEN,
			},
		}
	);
	const responseData: { data: IEventData[] } = await res.json();
	const events: IEventData[] = responseData.data;
	return events.map(({ timestamp, data }) => ({ ...data, timestamp }));
}

async function loadDashboard(id: string | number): Promise<IDashboard> {
	const res = await fetch(`${WEBSERVER_URL}/dashboards/${id}`, {
		headers: {
			Authorization: AUTH_TOKEN,
		},
	});
	const dashboard: IDashboard = await res.json();
	return dashboard;
}

export default function DashboardDetailPage() {
	const { dashboardId } = useParams();
	const [dashboard, setDashboard] = useState<IDashboard>();
	const [columns, setColumns] = useState<ColDef<Row>[]>([]);
	const [rowData, setRowData] = useState<Row[]>([]);
	const [page, setPage] = useState(1);
	const pageSize = 15;

	const [email, setEmail] = useState('');
	const [description, setDescription] = useState('');

	const {
		isOpen: isScriptDrawerOpen,
		onOpen: onScriptDrawerOpen,
		onOpenChange: onScriptDrawerChange,
	} = useDisclosure();

	const {
		isOpen: isOrderDrawerOpen,
		onOpen: onOrderDrawerOpen,
		onOpenChange: onOrderDrawerChange,
	} = useDisclosure();

	useEffect(() => {
		if (dashboardId)
			loadDashboard(dashboardId as string).then((res) => setDashboard(res));
	}, []);

	useEffect(() => {
		if (dashboard)
			loadDashboardEvents(dashboard?.timescaleIdentifier, page, pageSize).then(
				(data) => {
					if (data.length > 0 && columns.length === 0) {
						const keys = Object.keys(data[0]);
						const generatedColumns: ColDef<Row>[] = keys.map((key) => ({
							field: key as string,
							headerName: key,
							sortable: true,
							filter: true,
							flex: 1,
						}));
						setColumns(generatedColumns);
					}
					setRowData(data);
				}
			);
	}, [page, dashboard]);

	const handleOrderSubmit = async () => {
		if (!description.trim()) {
			addToast({
				title: 'Опис обовʼязковий',
				description: 'Будь ласка, опишіть бажану аналітику.',
			});
			return;
		}

		try {
			fetch(`${ANALYTICS_URL}/analyze-my/`, {
				method: 'POST',
				headers: {
					'content-type': 'application/json',
				},
				body: JSON.stringify({
					table_name: dashboard?.timescaleIdentifier,
					email,
					message: description,
				}),
			});

			addToast({
				title: 'Запит надіслано',
				description: 'Ми надішлемо результат на вашу пошту.',
			});
			onOrderDrawerChange();
			setEmail('');
			setDescription('');
		} catch (error) {
			addToast({
				title: 'Помилка при надсиланні',
				description: 'Спробуйте ще раз пізніше.',
			});
		}
	};

	const handleExportData = async () => {
		try {
			const res = await fetch(
				`${WEBSERVER_URL}/dashboards/events/export/${dashboard?.timescaleIdentifier}`,
				{
					method: 'GET',
					headers: {
						Authorization: AUTH_TOKEN,
					},
				}
			);

			if (!res.ok) throw new Error('Ошибка при скачивании файла');

			const blob = await res.blob();
			const url = window.URL.createObjectURL(blob);

			const a = document.createElement('a');
			a.href = url;
			a.download = 'dashboard_1.csv'; // Название файла
			document.body.appendChild(a);
			a.click();
			a.remove();
			window.URL.revokeObjectURL(url);
		} catch (err) {
			console.error('❌ Ошибка загрузки:', err);
		}
	};

	const handleImportData = async () => {
		const input = document.createElement('input');
		input.type = 'file';
		input.accept = '.csv';
		input.onchange = async () => {
			if (!input.files?.length || !dashboard?.timescaleIdentifier) return;
			const file = input.files[0];
			const formData = new FormData();
			formData.append('file', file);
			formData.append('timescaleIdentifier', dashboard.timescaleIdentifier);

			try {
				const res = await fetch(`${WEBSERVER_URL}/dashboards/events/bulk/csv`, {
					method: 'POST',
					headers: {
						Authorization: AUTH_TOKEN,
					},
					body: formData,
				});

				if (!res.ok) throw new Error();

				addToast({
					title: 'Імпорт завершено',
					description: 'Дані успішно імпортовано з CSV.',
				});

				// оновити таблицю
				loadDashboardEvents(dashboard.timescaleIdentifier, page, pageSize).then(
					setRowData
				);
			} catch (error) {
				addToast({
					title: 'Помилка імпорту CSV',
					description: 'Не вдалося завантажити файл.',
					status: 'error',
				});
			}
		};
		input.click();
	};

	return (
		<div className='mt-16 px-6 w-full'>
			<h1 className='text-4xl font-bold mb-4'>{dashboard?.name}</h1>

			<div className='w-full flex justify-end gap-4'>
				<Button onPress={handleImportData}>Імпортувати дані</Button>
				<Button onPress={handleExportData}>Експортувати дані</Button>
				<Button onPress={onScriptDrawerOpen}>Підключити скрипт</Button>
				<Button onPress={onOrderDrawerOpen}>Замовити аналітику</Button>
			</div>

			<div
				className='ag-theme-alpine mt-8'
				style={{ height: 600, width: '100%' }}
			>
				<AgGridReact<Row>
					rowData={rowData}
					columnDefs={columns}
					defaultColDef={{
						resizable: true,
						sortable: true,
						filter: true,
					}}
					pagination={false}
				/>
			</div>

			<div className='flex items-center justify-end gap-4 mt-4'>
				<Button
					disabled={page === 1}
					onPress={() => setPage((p) => Math.max(1, p - 1))}
				>
					Попередня
				</Button>
				<span>Сторінка {page}</span>
				<Button onPress={() => setPage((p) => p + 1)}>Наступна</Button>
			</div>

			{/* Drawer: Підключити скрипт */}
			<Drawer
				isOpen={isScriptDrawerOpen}
				onOpenChange={onScriptDrawerChange}
				placement='right'
				radius='none'
				size='lg'
			>
				<DrawerContent>
					<DrawerHeader>Cкрипт збору подій</DrawerHeader>
					<DrawerBody>
						<p className='mb-2 text-lg'>
							Скопіюйте скрипт та додайте його до вашого додадку, щоб зберігати
							події у ральному часі:
						</p>
						<Tabs aria-label='Options'>
							<Tab key='js' title='Java Script'>
								<Snippet className='w-full'>
									<span>
										fetch("http://localhost:3000/dashboards/events", &#123;
									</span>
									<span> method: "POST",</span>
									<span> headers: &#123;</span>
									<span> "Authorization": "Bearer &lt;your_token&gt;",</span>
									<span> "Content-Type": "application/json"</span>
									<span> &#125;,</span>
									<span> body: JSON.stringify(&#123;</span>
									<span>
										{' '}
										timescaleIdentifier: "{dashboard?.timescaleIdentifier}",
									</span>
									<span>
										{' '}
										metadata: &#123;&#123;Your Event Data&#125;&#125;
									</span>
									<span> &#125;)</span>
								</Snippet>
							</Tab>
							<Tab key='python' title='Python'>
								{' '}
								<Snippet className='w-full'>
									<span>import requests</span>
									<span>url = "http://localhost:3000/dashboards/events"</span>
									<span>headers = &#123;</span>
									<span> "Authorization": "Bearer &lt;your_token&gt;",</span>
									<span> "Content-Type": "application/json"</span>
									<span>&#125;</span>
									<span>payload = &#123;</span>
									<span>
										{' '}
										"timescaleIdentifier": "{dashboard?.timescaleIdentifier}",
									</span>
									<span>
										{' '}
										"metadata": &#123;&#123;Your Event Data&#125;&#125;
									</span>
									<span>&#125;</span>
									<span>response</span>
									<span>
										= requests.post(url, headers=headers, json=payload)
									</span>
								</Snippet>
							</Tab>
							<Tab key='curl' title='Curl'>
								<Snippet className='w-full'>
									<span>
										curl -X POST http://localhost:3000/dashboards/events \
									</span>
									<span> -H "Authorization: Bearer &lt;your_token&gt;" \</span>
									<span> -H "Content-Type: application/json" \</span>
									<span> {'{ -d {{}'}</span>
									<span>
										{' '}
										"timescaleIdentifier": "{dashboard?.timescaleIdentifier}",
									</span>
									<span> "metadata": {'{{Your Event Data}}'}</span>
									<span> {'}}'}'</span>
								</Snippet>
							</Tab>
						</Tabs>
					</DrawerBody>
					<DrawerFooter>
						<Button variant='solid' onPress={onScriptDrawerChange}>
							Закрити
						</Button>
					</DrawerFooter>
				</DrawerContent>
			</Drawer>

			{/* Drawer: Замовити аналітику */}
			<Drawer
				isOpen={isOrderDrawerOpen}
				onOpenChange={onOrderDrawerChange}
				placement='right'
			>
				<DrawerContent>
					<DrawerHeader>Замовити аналітику</DrawerHeader>
					<DrawerBody>
						<p className='text-sm text-gray-500 mb-3'>
							Після надсилання запиту аналітика буде згенерована за допомогою
							LLM-моделі та надіслана на вказану електронну пошту.
						</p>
						<p className='text-sm text-danger mb-3'>
							Поле "Опишіть задачу" є обовʼязковим для заповнення.
						</p>
						<Input
							label='Ваш email'
							placeholder='you@example.com'
							className='mb-4'
							value={email}
							onChange={(e) => setEmail(e.target.value)}
						/>
						<Textarea
							label='Опишіть задачу'
							placeholder='Я хочу отримати графік по відвідуванням...'
							isRequired
							value={description}
							onChange={(e) => setDescription(e.target.value)}
						/>
					</DrawerBody>
					<DrawerFooter>
						<Button variant='light' onPress={onOrderDrawerChange}>
							Скасувати
						</Button>
						<Button color='primary' onPress={handleOrderSubmit}>
							Надіслати запит
						</Button>
					</DrawerFooter>
				</DrawerContent>
			</Drawer>
		</div>
	);
}
