import { Button } from '@heroui/button';
import { Link } from '@heroui/link';

export default function Home() {
	return (
		<section className='flex flex-col items-center justify-center  py-20 px-4'>
			<div className='max-w-5xl w-full text-center'>
				<h1 className='text-5xl font-extrabold mb-6'>
					Інтелектуальний веб-сервіс для збору та аналітики подій програмного
					забезпечення
				</h1>
				<p className='text-xl mb-6 '>
					Сервіс надає зручний інструментарій для автоматизованого збору логів,
					моніторингу помилок та глибокого аналізу поведінки користувачів.
				</p>
				<p className='text-lg mb-6 '>
					Інтеграція з будь-яким застосунком займає лічені хвилини, після чого
					ви отримуєте гнучкий дашборд, розширені фільтри подій та систему
					сповіщень у реальному часі.
				</p>
				<div className='text-lg mb-12'>
					Ідеально підходить як для стартапів, так і для великих команд
					розробників, DevOps-спеціалістів і QA-інженерів.
				</div>
				<div className='flex justify-center gap-6'>
					<Link href='/register'>
						<Button className='text-lg px-8 py-3 rounded-2xl' size='lg'>
							Зареєструватися
						</Button>
					</Link>
					<Link href='/login'>
						<Button size='lg' variant='solid' className='text-lg px-8 py-3 rounded-2xl' color='primary'>
							Увійти
						</Button>
					</Link>
				</div>
			</div>
		</section>
	);
}
