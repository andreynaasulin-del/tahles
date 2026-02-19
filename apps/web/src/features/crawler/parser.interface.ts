
import { RawTitiListing, RawTitiProfile } from './types';

/** Describes a section/category of a source site to crawl */
export interface CrawlSection {
    /** URL of the listing page (page 1) */
    url: string;
    /** Tahles category slug to assign (null = no specific category) */
    categorySlug: string | null;
    /** Label for logging */
    label: string;
}

export interface SiteParser {
    source: string;
    baseUrl: string;
    /** All sections to crawl from this source */
    sections: CrawlSection[];
    parseListing(html: string): RawTitiListing[];
    parseProfile(html: string, listing: RawTitiListing): RawTitiProfile;
}
