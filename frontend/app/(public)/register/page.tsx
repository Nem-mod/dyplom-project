'use client';

import { useState } from 'react';
import { Card, CardHeader, CardBody } from '@heroui/card';
import { Input } from '@heroui/input';
import { Button } from '@heroui/button';

export default function RegisterPage() {
	const [formData, setFormData] = useState({
		name: '',
		email: '',
		password: '',
	});

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		console.log('Submitted registration data:', formData);
		// TODO: API call
	};

	return (
		<div className='flex items-center justify-center mt-16'>
			<Card className='w-full max-w-md p-4'>
				<CardHeader className='text-2xl font-semibold'>Реєстрація</CardHeader>
				<CardBody>
					<form onSubmit={handleSubmit} className='space-y-4'>
						<Input
							label='Ім’я'
							name='name'
							value={formData.name}
							onChange={handleChange}
							isRequired
						/>
						<Input
							label='Електронна пошта'
							name='email'
							type='email'
							value={formData.email}
							onChange={handleChange}
							isRequired
						/>
						<Input
							label='Пароль'
							name='password'
							type='password'
							value={formData.password}
							onChange={handleChange}
							isRequired
						/>
						<Button color='primary' type='submit' fullWidth>
							Зареєструватися
						</Button>
					</form>
				</CardBody>
			</Card>
		</div>
	);
}
