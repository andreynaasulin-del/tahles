'use client'

import { useTranslation } from '@/lib/i18n/useTranslation'
import type { TranslationKey } from '@/lib/i18n/translations'

interface Filter {
  id: string
  labelKey: TranslationKey
  tipKey: TranslationKey
}

const FILTERS: Filter[] = [
  { id: 'listed',     labelKey: 'filter_listed',     tipKey: 'filter_listed_tip'     },
  { id: 'basic',      labelKey: 'filter_basic',      tipKey: 'filter_basic_tip'      },
  { id: 'paid',       labelKey: 'filter_paid',       tipKey: 'filter_paid_tip'       },
  { id: 'vip1500',    labelKey: 'filter_vip1500',    tipKey: 'filter_vip1500_tip'    },
  { id: 'up1000',     labelKey: 'filter_up1000',     tipKey: 'filter_up1000_tip'     },
  { id: 'massage',    labelKey: 'filter_massage',    tipKey: 'filter_massage_tip'    },
  { id: 'striptease', labelKey: 'filter_striptease', tipKey: 'filter_striptease_tip' },
  { id: 'domina',     labelKey: 'filter_domina',     tipKey: 'filter_domina_tip'     },
  { id: 'kinky',      labelKey: 'filter_kinky',      tipKey: 'filter_kinky_tip'      },
]

interface FilterBlocksProps {
  active: string
  onChange: (id: string) => void
}

export function FilterBlocks({ active, onChange }: FilterBlocksProps) {
  const { t } = useTranslation()

  return (
    <div className="w-full overflow-x-auto scrollbar-none">
      <div className="flex gap-2 min-w-max py-1">
        {FILTERS.map((f) => {
          const isActive = active === f.id
          return (
            <div key={f.id} className="relative group">
              <button
                onClick={() => onChange(isActive ? '' : f.id)}
                className={`
                  px-5 py-2.5 text-sm font-semibold border transition-all duration-150 whitespace-nowrap select-none
                  ${isActive
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-black border-black/15 hover:border-black/40 hover:bg-black/[0.03]'}
                `}
                style={{ letterSpacing: '-0.01em' }}
              >
                {t(f.labelKey)}
              </button>
              {/* Tooltip */}
              <div className="absolute bottom-full left-0 mb-2 z-50 bg-black text-white text-[11px] px-3 py-2 whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150" style={{ lineHeight: '1.4' }}>
                {t(f.tipKey)}
                <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-black" />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
