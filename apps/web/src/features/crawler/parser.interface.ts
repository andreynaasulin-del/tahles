
import { RawTitiListing, RawTitiProfile } from './types';

export interface SiteParser {
    source: string;
    baseUrl: string;
    parseListing(html: string): RawTitiListing[];
    parseProfile(html: string, listing: RawTitiListing): RawTitiProfile;
}
