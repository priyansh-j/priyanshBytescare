const valid_source = "https://bypasser.bytescare.com/bp/this/";

const sourceList = {
    SEARCH: 1,
    SOCIAL: 2,
    YOUTUBE: 3,
    TORRENT: 4,
    DEFAULT: 0,
};

const status = {
    OTHER: 0,
    POSSIBLE: 1,
    P2P: 2,
    NON_HTTP: 3,
    POSSIBLE_BY_IMAGE: 4,
    ALREADY_BLOCKED: 5,
    RIPPER: 6,
    ARTICLE_COPY: 7,
};

const rejected_by = {
    NONE: 0,
    VALIDITY: 1,
    PROTOCOL: 2,
    PATHNAME: 3,
    HOST: 4,
    PATH: 5,
    QUERY: 6,
    TEXT: 7,
    EXTRAS: 8,
    LEVEL2: 9,
    HASH: 10,
    IMAGE: 11, // 12-15 Reserved for Images (Check SportsFilter)
    HISTOGRAM: 12,
    OCR: 13,
    MOTION: 14,
    LOGO: 15,
    LEVEL2_UNUSUAL_PATH: 16,
    LEVEL2_HTML_ASSET: 17,
    LEVEL2_NO_ASSET_MATCH: 18,
    LEVEL2_TEAM: 19,
    LEVEL2_PUBLISHER: 20,
    LEVEL2_TOURNAMENT: 21,
    FULL_URL: 22,
    ALREADY_BLOCKED: 23,
    LEVEL1_TEAM: 24,
    LEVEL1_PUBLISHER: 25,
    LEVEL1_TOURNAMENT: 26,
    NOT_FOUND: 404,
    OFFICIAL: 999,
};

export { valid_source, sourceList, status, rejected_by };
