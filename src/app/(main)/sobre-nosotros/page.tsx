import type { Metadata } from 'next'
import type { CSSProperties } from 'react'
import { getServerLocale } from '@/lib/i18n-server'
import { translate } from '@/lib/i18n'
import { PageHeader } from '@/components/lh/PageHeader'
import { Reveal } from '@/components/lh/Reveal'

const PAGE_URL = 'https://www.latinterritory.com/sobre-nosotros'

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale()
  const t = (k: string) => translate(k, { locale })
  const title = t('about.meta.title')
  const description = t('about.meta.description')
  return {
    title,
    description,
    alternates: { canonical: PAGE_URL },
    openGraph: {
      title: `${title} | Latin Territory`,
      description,
      type: 'website',
      url: PAGE_URL,
      siteName: 'Latin Territory',
      locale: locale === 'es' ? 'es_AU' : 'en_AU',
    },
  }
}

const SECTIONS = [
  { title: 'about.find.title', body: 'about.find.body' },
  { title: 'about.mission.title', body: 'about.mission.body' },
  { title: 'about.origin.title', body: 'about.origin.body' },
] as const

const lead: CSSProperties = {
  fontSize: 'clamp(17px, 2.2vw, 19px)',
  lineHeight: 1.7,
  color: 'var(--lh-fg2)',
  margin: 0,
}

const body: CSSProperties = {
  fontSize: 16,
  lineHeight: 1.7,
  color: 'var(--lh-fg2)',
  margin: 0,
}

export default async function AboutPage() {
  const locale = await getServerLocale()
  const t = (k: string) => translate(k, { locale })

  return (
    <div style={{ background: 'var(--lh-bg)', fontFamily: 'var(--lh-font)' }}>
      <PageHeader eyebrow={t('about.eyebrow')} title={t('about.title')} />

      <div
        className="lh-container"
        style={{ maxWidth: 760, paddingTop: 'clamp(40px, 6vw, 64px)', paddingBottom: 'clamp(56px, 8vw, 96px)' }}
      >
        <article>
          <Reveal>
            <p style={lead}>{t('about.intro.p1')}</p>
            <p style={{ ...lead, marginTop: 20 }}>{t('about.intro.p2')}</p>
          </Reveal>

          {SECTIONS.map(({ title, body: bodyKey }) => (
            <Reveal key={title}>
              <section style={{ marginTop: 'clamp(40px, 6vw, 56px)' }}>
                <h2 className="lh-h2" style={{ fontSize: 'clamp(22px, 3vw, 28px)', margin: '0 0 14px' }}>
                  {t(title)}
                </h2>
                <p style={body}>{t(bodyKey)}</p>
              </section>
            </Reveal>
          ))}

          <Reveal>
            <p style={{ ...body, marginTop: 'clamp(40px, 6vw, 56px)' }}>{t('about.closing')}</p>
          </Reveal>

          <Reveal>
            <p
              className="lh-h2"
              style={{
                fontSize: 'clamp(24px, 4vw, 34px)',
                color: 'var(--lh-accent)',
                textAlign: 'center',
                margin: 0,
                marginTop: 'clamp(48px, 7vw, 72px)',
                paddingTop: 'clamp(32px, 5vw, 48px)',
                borderTop: '1px solid var(--lh-border2)',
              }}
            >
              {t('about.tagline')}
            </p>
          </Reveal>
        </article>
      </div>
    </div>
  )
}
