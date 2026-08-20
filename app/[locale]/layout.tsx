import { notFound } from 'next/navigation'
import { hasLocale, locales, type Locale } from './dictionaries'

export async function generateStaticParams() {
  return locales.map(locale => ({ locale }))
}

type Props = {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params
  if (!hasLocale(locale)) notFound()
  return <>{children}</>
}
