
export enum ApplicationStatus {
    APPLIED = 'APPLIED',
    OA = 'OA',
    INTERVIEW = 'INTERVIEW',
    REJECTED = 'REJECTED',
    OFFER = 'OFFER',
}

export interface JobApplication {
    id: string
    user_id: string
    company: string
    role: string
    job_link?: string
    application_status: ApplicationStatus
    resume_url?: string
    email_used?: string
    password_used?: string // Will be encrypted string from DB
    location?: string
    referral?: string
    note?: string
    created_at: string
    updated_at: string
}

export interface FriendRequest {
    id: string
    sender_id: string
    receiver_email: string
    sender_email?: string // Sender's email (stored when creating request)
    status: 'PENDING' | 'ACCEPTED' | 'REJECTED'
    created_at: string
}

export interface Notification {
    id: string
    user_id: string
    type: string
    message: string
    data?: any
    link?: string // Link to navigate when notification is clicked
    is_read: boolean
    created_at: string
}

export interface Todo {
    id: string
    user_id: string
    title: string
    is_completed: boolean
    date: string // ISO date string (YYYY-MM-DD)
    created_at: string
    updated_at: string
}

export interface DailyCompletion {
    id: string
    user_id: string
    date: string // ISO date string (YYYY-MM-DD)
    total_tasks: number
    completed_tasks: number
    completion_percentage: number // 0-100
    created_at: string
    updated_at: string
}

export type ResourceType = 'PDF' | 'LINK' | 'NOTE'

export interface Resource {
    id: string
    user_id: string
    title: string
    type: ResourceType
    content: string // File path for PDF, URL for LINK, text content for NOTE
    description?: string
    tags?: string[]
    created_at: string
    updated_at: string
}
