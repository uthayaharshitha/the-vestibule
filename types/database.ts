// Database type definitions
export interface User {
    id: string;
    created_at: string;
    is_anonymous: boolean;
    pseudonym: string | null;
    role: 'user' | 'admin';
    status: 'active' | 'suspended';
}

export interface Capsule {
    id: string;
    creator_id: string | null;
    title: string;
    description: string | null;
    short_description: string | null;
    theme_color: string | null;
    cover_image_url: string | null;
    created_at: string;
    updated_at: string;
    status: 'active' | 'flagged' | 'removed';
    visibility: 'public' | 'hidden';
    background_color: string | null;
    capsule_media?: CapsuleMedia[];
    capsule_audio?: CapsuleAudio[];
    capsule_notes?: CapsuleNote[];
    capsule_tags?: { tags: Tag }[];
    capsule_hashtags?: CapsuleHashtag[];
}

export interface CapsuleMedia {
    id: string;
    capsule_id: string;
    media_type: 'image' | 'video';
    file_url: string;
    thumbnail_url: string | null;
    order_index: number;
    created_at: string;
}

export interface CapsuleAudio {
    id: string;
    capsule_id: string;
    file_url: string;
    duration_seconds: number | null;
    created_at: string;
}

export interface CapsuleNote {
    id: string;
    capsule_id: string;
    note_text: string;
    order_index: number;
}

export interface Tag {
    id: string;
    name: string;
}

export interface CapsuleHashtag {
    id: string;
    capsule_id: string;
    hashtag: string;
    order_index: number;
    created_at: string;
}


export interface Contribution {
    id: string;
    capsule_id: string;
    user_id: string | null;
    content_type: 'writing' | 'reflection' | 'poem';
    content_text: string | null;
    created_at: string;
    status: 'active' | 'flagged' | 'removed';
    is_anonymous?: boolean;
    pseudonym?: string | null;
    is_edited?: boolean;
    box_color?: string | null;
}

export interface ContributionMedia {
    id: string;
    contribution_id: string;
    media_type: 'image' | 'video' | 'audio';
    file_url: string;
    thumbnail_url: string | null;
    created_at: string;
}

export interface Report {
    id: string;
    reporter_id: string | null;
    target_type: 'capsule' | 'contribution';
    target_id: string;
    reason: string | null;
    created_at: string;
    status: 'pending' | 'reviewed' | 'dismissed';
}

// Extended types with relations
export interface CapsuleWithMedia extends Capsule {
    capsule_media: CapsuleMedia[];
    capsule_audio: CapsuleAudio[];
    capsule_notes: CapsuleNote[];
}
