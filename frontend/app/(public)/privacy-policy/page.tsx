import React from 'react'

export default function PrivacyPolicy() {
	return (
		<section className='flex flex-col items-center justify-start'>
			<div className='max-w-4xl w-full'>
				<h1 className='text-4xl font-bold mb-6'>Політика конфіденційності</h1>

				<p className='mb-4 text-gray-700'>
					Ми поважаємо вашу конфіденційність і прагнемо захищати особисту
					інформацію, яку ви надаєте під час використання нашого веб-сервісу. У
					цій політиці пояснюється, які дані ми збираємо, як ми їх
					використовуємо та зберігаємо.
				</p>

				<h2 className='text-2xl font-semibold mt-6 mb-2'>1. Збір інформації</h2>
				<p className='mb-4 text-gray-700'>
					Ми можемо збирати персональні дані, такі як ім'я, електронна пошта, а
					також технічну інформацію: IP-адреса, дані про браузер, час доступу
					тощо. Ми також збираємо події з вашого програмного забезпечення для
					подальшого аналізу.
				</p>

				<h2 className='text-2xl font-semibold mt-6 mb-2'>
					2. Використання інформації
				</h2>
				<p className='mb-4 text-gray-700'>
					Зібрані дані використовуються для покращення нашого сервісу, технічної
					підтримки, виявлення помилок, оптимізації продуктивності та надання
					персоналізованого досвіду користувачам.
				</p>

				<h2 className='text-2xl font-semibold mt-6 mb-2'>
					3. Захист інформації
				</h2>
				<p className='mb-4 text-gray-700'>
					Ми впроваджуємо сучасні засоби безпеки для захисту ваших даних від
					несанкціонованого доступу, змін, розголошення або знищення. Уся
					передача даних здійснюється через захищені канали.
				</p>

				<h2 className='text-2xl font-semibold mt-6 mb-2'>
					4. Права користувачів
				</h2>
				<p className='mb-4 text-gray-700'>
					Ви маєте право на доступ до своїх персональних даних, їх виправлення
					або видалення. Якщо у вас є запити щодо вашої інформації, зв'яжіться з
					нами через контактну форму.
				</p>

				<h2 className='text-2xl font-semibold mt-6 mb-2'>
					5. Зміни до політики
				</h2>
				<p className='mb-4 text-gray-700'>
					Ми можемо періодично оновлювати цю політику конфіденційності. Зміни
					будуть публікуватися на цій сторінці з відповідною датою оновлення.
				</p>

				<p className='text-sm text-gray-500 mt-8'>
					Останнє оновлення: Травень 2025
				</p>
			</div>
		</section>
	);
}
