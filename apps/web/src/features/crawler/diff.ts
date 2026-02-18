import { AdRow } from '@vm/db'
import { NormalizedData } from './types'

export type ChangeType = 'new' | 'updated' | 'unchanged' | 'removed'

export interface DiffResult {
    type: ChangeType
    changedFields: string[]
    before: Partial<AdRow> | null
    after: Partial<AdRow>
}

export function diffProfile(existing: AdRow | null, incoming: NormalizedData['ad']): DiffResult {
    if (!existing) {
        return {
            type: 'new',
            changedFields: [],
            before: null,
            after: incoming
        }
    }

    const changedFields: string[] = []
    const fieldsToCompare: (keyof AdRow)[] = [
        'nickname', 'description', 'price_min', 'price_max', 'city',
        'online_status', 'vip_status', 'verified', 'photos'
    ]

    fieldsToCompare.forEach(field => {
        const oldVal = JSON.stringify(existing[field])
        const newVal = JSON.stringify(incoming[field as keyof typeof incoming])
        if (oldVal !== newVal) {
            changedFields.push(field)
        }
    })

    // Also check contacts if we had them (simplified for now)

    if (changedFields.length > 0) {
        return {
            type: 'updated',
            changedFields,
            before: existing,
            after: incoming
        }
    }

    return {
        type: 'unchanged',
        changedFields: [],
        before: existing,
        after: incoming
    }
}
