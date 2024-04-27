import React, { useMemo } from 'react'
import pkg from '../../../package.json'
import type { Languages } from '@/i18n'
import clsx from 'clsx'

const name = pkg.name
const repoUrl = pkg.repository.url
const origin = 'https://github.com/'
const repo = repoUrl.replace(origin, '')
const color = '29c1e9'

const options = [
  {
    link: `https://www.npmjs.com/package/${name}`,
    image: `https://img.shields.io/npm/v/${name}?color=${color}&label=npm`,
    title: 'The latest version',
  },
  {
    link: `https://www.npmjs.com/package/${name}`,
    image: `https://img.shields.io/npm/dt/${name}?color=${color}&label=downloads`,
    title: 'Download counts',
  },
  {
    link: repoUrl,
    image: `https://img.shields.io/github/stars/${repo}?style=social`,
    title: 'GitHub stars',
  },
]

export const StatisticalData: React.FC = () => {
  return (
    <div className="flex items-center gap-2">
      {options.map((i) => {
        return (
          <a
            key={i.title}
            title={i.title}
            href={i.link}
            target="__blank"
            rel="sponsored nofollow noopener noreferrer"
          >
            <img alt={i.title} src={i.image} />
          </a>
        )
      })}
    </div>
  )
}

const getContributors = async (cols = 10) => {
  try {
    const url = `https://contrib.nn.ci/api?repo=${repo}&cols=${cols}&no_bot`
    return await fetch(url).then((res) => res.text() || '')
  } catch (e) {
    return ''
  }
}

const contributorsData = await getContributors()

interface ContributorInfo {
  homepage: string
  username: string
  avatar: string
}

export const Contributors: React.FC<{
  lang: Languages
}> = ({ lang }) => {
  const getItems = () => {
    if (typeof window === 'undefined') return []

    const parser = new DOMParser()
    const xmlDoc = parser.parseFromString(contributorsData, 'text/xml')
    const svg = xmlDoc.getElementsByTagName('svg')[0]
    if (!svg) return []

    const elements = xmlDoc.querySelectorAll('a.link')
    const items = [...elements].map<ContributorInfo>((element) => {
      const homepage = element?.getAttribute('xlink:href') || ''
      const username = homepage.replace(origin, '')
      const avatar = `https://avatars.githubusercontent.com/${username}`
      return { homepage, username, avatar }
    })

    return items
  }

  const items = useMemo(() => {
    return getItems()
  }, [])

  const emptyTips = useMemo(() => {
    return lang === 'zh'
      ? '获取数据失败，请刷新页面重试。'
      : 'Failed to obtain data, please refresh the page.'
  }, [lang])

  const cls = clsx('flex flex-wrap gap-6 w-full mt-6')

  if (!items.length) {
    return <div className={cls}>{emptyTips}</div>
  }

  return (
    <div className={cls}>
      {items.map((i) => {
        return (
          <a
            key={i.username}
            title={i.username}
            href={i.homepage}
            target="_blank"
            rel="noreferrer"
            className="flex flex-col items-center no-underline hover:underline"
          >
            <div className="w-16 h-16 rounded-full overflow-hidden">
              <img
                className="w-full h-full object-cover"
                src={i.avatar}
                alt={i.username}
              />
            </div>
          </a>
        )
      })}
    </div>
  )
}
