"use client"

import Link from 'next/link'
import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin } from 'lucide-react'
import { useTranslations } from '@/components/providers/language-provider'

export function Footer() {
  const { t } = useTranslations()
  const year = new Date().getFullYear()
  return (
    <footer className="bg-background text-foreground border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-red-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">LT</span>
              </div>
              <span className="text-xl font-bold">{t('app.name')}</span>
            </div>
            <p className="text-foreground/70 mb-4">{t('footer.tagline')}</p>
            <div className="flex space-x-4">
              <a href="#" className="text-foreground/70 hover:text-foreground transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-foreground/70 hover:text-foreground transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-foreground/70 hover:text-foreground transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-foreground/70 hover:text-foreground transition-colors">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('footer.quickLinks')}</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/directorio" className="text-foreground/70 hover:text-foreground transition-colors">
                  {t('footer.links.directory')}
                </Link>
              </li>
              <li>
                <Link href="/foros" className="text-foreground/70 hover:text-foreground transition-colors">
                  {t('footer.links.forums')}
                </Link>
              </li>
              <li>
                <Link href="/deportes" className="text-foreground/70 hover:text-foreground transition-colors">
                  {t('footer.links.sports')}
                </Link>
              </li>
              <li>
                <Link href="/clima" className="text-foreground/70 hover:text-foreground transition-colors">
                  {t('footer.links.weather')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('footer.categories')}</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/categoria/gastronomia" className="text-foreground/70 hover:text-foreground transition-colors">
                  {t('footer.category.gastronomy')}
                </Link>
              </li>
              <li>
                <Link href="/categoria/tecnologia" className="text-foreground/70 hover:text-foreground transition-colors">
                  {t('footer.category.technology')}
                </Link>
              </li>
              <li>
                <Link href="/categoria/artesanias" className="text-foreground/70 hover:text-foreground transition-colors">
                  {t('footer.category.handicrafts')}
                </Link>
              </li>
              <li>
                <Link href="/categoria/moda" className="text-foreground/70 hover:text-foreground transition-colors">
                  {t('footer.category.fashion')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('footer.contact')}</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4" />
                <span className="text-foreground/70">javiguerreroz86@gmail.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4" />
                <span className="text-foreground/70">+61 0433560234</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-4 w-4" />
                <span className="text-foreground/70">Brisbane, Australia</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-foreground/70 text-sm">© {year} {t('app.name')}. {t('footer.rights')}</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="/privacidad" className="text-foreground/70 hover:text-foreground text-sm transition-colors">
                {t('footer.privacy')}
              </Link>
              <Link href="/terminos" className="text-foreground/70 hover:text-foreground text-sm transition-colors">
                {t('footer.terms')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
