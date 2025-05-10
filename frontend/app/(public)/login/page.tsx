'use client';

import { Input } from '@heroui/input';
import { Button } from '@heroui/button';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { useState } from 'react';

export default function LoginPage() {
	const [formData, setFormData] = useState({ email: '', password: '' });

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		console.log('Login attempt:', formData);
		// TODO: API call
	};

	return (
		<div className='flex items-center justify-center mt-16'>
			<Card className='w-full max-w-md p-4'>
				<CardHeader className='text-2xl font-semibold'>Вхід</CardHeader>
				<CardBody>
					<form onSubmit={handleSubmit} className='space-y-4'>
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
							Увійти
						</Button>
					</form>
				</CardBody>
			</Card>
		</div>
	);
}
