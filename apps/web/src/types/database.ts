export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type TableConfig<Row, Insert = Row, Update = Partial<Insert>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
};

export type ProfileLevel = 'Iniciante' | 'Entusiasta' | 'Grower Sênior' | 'Cultivador Indoor';

export type BadgeCode =
  | 'primeira-colheita'
  | 'brisado-lendario'
  | 'cultivador-indoor'
  | 'curioso-iluminado';

export type Database = {
  public: {
    Tables: {
      profiles: TableConfig<
        {
          id: string;
          username: string;
          display_name: string | null;
          avatar_url: string | null;
          bio: string | null;
          xp: number;
          level: ProfileLevel;
          pseudonymous: boolean;
          share_activity: boolean;
          email_notifications: boolean;
          onboarding_completed: boolean;
          moderation_status: 'active' | 'shadowbanned' | 'banned';
          is_admin: boolean;
          created_at: string;
          updated_at: string;
        },
        {
          id: string;
          username: string;
          display_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          xp?: number;
          level?: ProfileLevel;
          pseudonymous?: boolean;
          share_activity?: boolean;
          email_notifications?: boolean;
          onboarding_completed?: boolean;
          moderation_status?: 'active' | 'shadowbanned' | 'banned';
          is_admin?: boolean;
        },
        {
          username?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          xp?: number;
          level?: ProfileLevel;
          pseudonymous?: boolean;
          share_activity?: boolean;
          email_notifications?: boolean;
          onboarding_completed?: boolean;
          moderation_status?: 'active' | 'shadowbanned' | 'banned';
          is_admin?: boolean;
          updated_at?: string;
        }
      >;
      categories: TableConfig<
        {
          id: number;
          slug: string;
          label: string;
          description: string | null;
          icon: string | null;
          created_at: string;
        },
        {
          slug: string;
          label: string;
          description?: string | null;
          icon?: string | null;
        },
        {
          slug?: string;
          label?: string;
          description?: string | null;
          icon?: string | null;
        }
      >;
      posts: TableConfig<
        {
          id: string;
          author_id: string;
          category_id: number;
          title: string;
          content: string | null;
          media_url: string | null;
          media_type: string | null;
          link_preview: Json | null;
          is_pinned: boolean;
          is_deleted: boolean;
          upvotes_count: number;
          downvotes_count: number;
          comments_count: number;
          popularity_score: number;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          author_id: string;
          category_id: number;
          title: string;
          content?: string | null;
          media_url?: string | null;
          media_type?: string | null;
          link_preview?: Json | null;
          is_pinned?: boolean;
          is_deleted?: boolean;
          upvotes_count?: number;
          downvotes_count?: number;
          comments_count?: number;
          popularity_score?: number;
        },
        {
          category_id?: number;
          title?: string;
          content?: string | null;
          media_url?: string | null;
          media_type?: string | null;
          link_preview?: Json | null;
          is_pinned?: boolean;
          is_deleted?: boolean;
          upvotes_count?: number;
          downvotes_count?: number;
          comments_count?: number;
          popularity_score?: number;
          updated_at?: string;
        }
      >;
      post_votes: TableConfig<
        {
          post_id: string;
          user_id: string;
          value: number;
          created_at: string;
        },
        {
          post_id: string;
          user_id: string;
          value: number;
          created_at?: string;
        }
      >;
      comments: TableConfig<
        {
          id: string;
          post_id: string;
          author_id: string;
          parent_comment_id: string | null;
          depth: number;
          body: string;
          upvotes_count: number;
          downvotes_count: number;
          is_deleted: boolean;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          post_id: string;
          author_id: string;
          parent_comment_id?: string | null;
          depth?: number;
          body: string;
          upvotes_count?: number;
          downvotes_count?: number;
          is_deleted?: boolean;
        },
        {
          body?: string;
          is_deleted?: boolean;
          upvotes_count?: number;
          downvotes_count?: number;
          updated_at?: string;
        }
      >;
      comment_votes: TableConfig<
        {
          comment_id: string;
          user_id: string;
          value: number;
          created_at: string;
        },
        {
          comment_id: string;
          user_id: string;
          value: number;
          created_at?: string;
        }
      >;
      tags: TableConfig<
        {
          id: number;
          slug: string;
          label: string;
          usage_count: number;
          created_at: string;
        },
        {
          slug: string;
          label: string;
          usage_count?: number;
        },
        {
          label?: string;
          usage_count?: number;
        }
      >;
      post_tags: TableConfig<
        {
          post_id: string;
          tag_id: number;
          created_at: string;
        },
        {
          post_id: string;
          tag_id: number;
          created_at?: string;
        }
      >;
      post_flags: TableConfig<
        {
          id: string;
          post_id: string;
          reporter_id: string;
          reason: string | null;
          status: string;
          created_at: string;
          reviewed_at: string | null;
          reviewer_id: string | null;
          resolution_notes: string | null;
        },
        {
          id?: string;
          post_id: string;
          reporter_id: string;
          reason?: string | null;
          status?: string;
          created_at?: string;
          reviewed_at?: string | null;
          reviewer_id?: string | null;
          resolution_notes?: string | null;
        },
        {
          status?: string;
          reviewed_at?: string | null;
          reviewer_id?: string | null;
          resolution_notes?: string | null;
        }
      >;
      moderation_alerts: TableConfig<
        {
          id: string;
          user_id: string | null;
          alert_type: string;
          severity: string;
          metadata: Json;
          created_at: string;
          resolved_at: string | null;
          resolved_by: string | null;
        },
        {
          id?: string;
          user_id?: string | null;
          alert_type: string;
          severity?: string;
          metadata?: Json;
          created_at?: string;
          resolved_at?: string | null;
          resolved_by?: string | null;
        },
        {
          resolved_at?: string | null;
          resolved_by?: string | null;
          severity?: string;
        }
      >;
      badges: TableConfig<
        {
          code: BadgeCode;
          name: string;
          description: string;
          icon: string | null;
          created_at: string;
        },
        {
          code: BadgeCode;
          name: string;
          description: string;
          icon?: string | null;
          created_at?: string;
        }
      >;
      level_thresholds: TableConfig<
        {
          level: ProfileLevel;
          min_xp: number;
          description: string | null;
          created_at: string;
        },
        {
          level: ProfileLevel;
          min_xp: number;
          description?: string | null;
          created_at?: string;
        }
      >;
      user_badges: TableConfig<
        {
          id: string;
          user_id: string;
          badge_code: BadgeCode;
          awarded_at: string;
        },
        {
          id?: string;
          user_id: string;
          badge_code: BadgeCode;
          awarded_at?: string;
        }
      >;
      xp_history: TableConfig<
        {
          id: string;
          user_id: string;
          delta: number;
          source: string;
          metadata: Json | null;
          created_at: string;
        },
        {
          id?: string;
          user_id: string;
          delta: number;
          source: string;
          metadata?: Json | null;
          created_at?: string;
        }
      >;
      moderation_actions: TableConfig<
        {
          id: string;
          actor_id: string | null;
          target_type: string;
          target_id: string;
          action: string;
          reason: string | null;
          metadata: Json | null;
          created_at: string;
        },
        {
          id?: string;
          actor_id?: string | null;
          target_type: string;
          target_id: string;
          action: string;
          reason?: string | null;
          metadata?: Json | null;
          created_at?: string;
        }
      >;
      audit_logs: TableConfig<
        {
          id: string;
          user_id: string | null;
          action: string;
          metadata: Json;
          created_at: string;
        },
        {
          id?: string;
          user_id?: string | null;
          action: string;
          metadata?: Json;
          created_at?: string;
        }
      >;
    };
    Views: {
      leaderboard_weekly: {
        Row: {
          user_id: string;
          username: string;
          xp_gain: number;
          rank: number;
        };
      };
    };
    Functions: {
      register_audit_event: {
        Args: { action: string; metadata?: Json };
        Returns: void;
      };
    };
    Enums: {
      moderation_status: 'active' | 'shadowbanned' | 'banned';
    };
  };
};
