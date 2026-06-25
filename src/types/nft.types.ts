export interface NFTAttribute {
    trait_type: string;
    value: string | number;
    trait_type_lower_case?: string;
    value_lower_case?: string;
}

export interface NFTMetadata {
    attributes: NFTAttribute[];
    description: string;
}

export interface NFTMedia {
    url: string;
    originalUrl: string;
    thumbnailUrl: string;
    fileType: string;
    fileSize: number;
}

export interface MultiversXNFT {
    identifier: string;
    collection: string;
    name: string;
    url: string;
    media: NFTMedia[];
    metadata: NFTMetadata;
    nonce: number;
    timestamp: number;
}
