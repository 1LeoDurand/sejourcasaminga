export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      analytics_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          metadata: Json | null
          page: string | null
          reference_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          metadata?: Json | null
          page?: string | null
          reference_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          metadata?: Json | null
          page?: string | null
          reference_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      availabilities: {
        Row: {
          created_at: string
          end_date: string
          id: string
          listing_id: string
          start_date: string
          status: string
        }
        Insert: {
          created_at?: string
          end_date: string
          id?: string
          listing_id: string
          start_date: string
          status?: string
        }
        Update: {
          created_at?: string
          end_date?: string
          id?: string
          listing_id?: string
          start_date?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "availabilities_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_post_blocks: {
        Row: {
          block_type: string
          caption: string | null
          content_text: string | null
          created_at: string
          embed_url: string | null
          id: string
          media_url: string | null
          metadata_json: Json | null
          post_id: string
          sort_order: number
        }
        Insert: {
          block_type: string
          caption?: string | null
          content_text?: string | null
          created_at?: string
          embed_url?: string | null
          id?: string
          media_url?: string | null
          metadata_json?: Json | null
          post_id: string
          sort_order?: number
        }
        Update: {
          block_type?: string
          caption?: string | null
          content_text?: string | null
          created_at?: string
          embed_url?: string | null
          id?: string
          media_url?: string | null
          metadata_json?: Json | null
          post_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "blog_post_blocks_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_posts: {
        Row: {
          category: string | null
          content: string | null
          cover_image: string | null
          created_at: string
          excerpt: string | null
          id: string
          is_published: boolean
          published_at: string | null
          slug: string
          title: string
        }
        Insert: {
          category?: string | null
          content?: string | null
          cover_image?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          is_published?: boolean
          published_at?: string | null
          slug: string
          title: string
        }
        Update: {
          category?: string | null
          content?: string | null
          cover_image?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          is_published?: boolean
          published_at?: string | null
          slug?: string
          title?: string
        }
        Relationships: []
      }
      conversation_participants: {
        Row: {
          conversation_id: string
          id: string
          joined_at: string
          last_read_at: string
          user_id: string
        }
        Insert: {
          conversation_id: string
          id?: string
          joined_at?: string
          last_read_at?: string
          user_id: string
        }
        Update: {
          conversation_id?: string
          id?: string
          joined_at?: string
          last_read_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_participants_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          listing_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          listing_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          listing_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      exchange_requests: {
        Row: {
          accepted_terms: boolean
          created_at: string
          end_date: string
          exchange_type: string
          from_user_id: string
          id: string
          listing_id: string
          message: string | null
          number_of_guests: number | null
          start_date: string
          status: string
          to_member_id: string
          updated_at: string
        }
        Insert: {
          accepted_terms?: boolean
          created_at?: string
          end_date: string
          exchange_type?: string
          from_user_id: string
          id?: string
          listing_id: string
          message?: string | null
          number_of_guests?: number | null
          start_date: string
          status?: string
          to_member_id: string
          updated_at?: string
        }
        Update: {
          accepted_terms?: boolean
          created_at?: string
          end_date?: string
          exchange_type?: string
          from_user_id?: string
          id?: string
          listing_id?: string
          message?: string | null
          number_of_guests?: number | null
          start_date?: string
          status?: string
          to_member_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "exchange_requests_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      favorites: {
        Row: {
          created_at: string
          id: string
          listing_id: string
          notes: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          listing_id: string
          notes?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          listing_id?: string
          notes?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback: {
        Row: {
          created_at: string
          email: string | null
          id: string
          message: string
          page_url: string | null
          status: string
          type: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          message: string
          page_url?: string | null
          status?: string
          type: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          message?: string
          page_url?: string | null
          status?: string
          type?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      habitat_event_interests: {
        Row: {
          created_at: string
          event_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "habitat_event_interests_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "habitat_events"
            referencedColumns: ["id"]
          },
        ]
      }
      habitat_events: {
        Row: {
          created_at: string
          created_by: string
          date_end: string | null
          date_start: string
          description: string | null
          event_type: string
          id: string
          is_public: boolean
          max_participants: number | null
          place_id: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          date_end?: string | null
          date_start: string
          description?: string | null
          event_type?: string
          id?: string
          is_public?: boolean
          max_participants?: number | null
          place_id: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          date_end?: string | null
          date_start?: string
          description?: string | null
          event_type?: string
          id?: string
          is_public?: boolean
          max_participants?: number | null
          place_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "habitat_events_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
        ]
      }
      link_scan_results: {
        Row: {
          checked_at: string
          error_message: string | null
          id: string
          redirect_to: string | null
          scan_id: string
          severity: string
          source_page: string | null
          status_code: number | null
          suggestion: string | null
          type: string
          url: string
        }
        Insert: {
          checked_at?: string
          error_message?: string | null
          id?: string
          redirect_to?: string | null
          scan_id: string
          severity: string
          source_page?: string | null
          status_code?: number | null
          suggestion?: string | null
          type: string
          url: string
        }
        Update: {
          checked_at?: string
          error_message?: string | null
          id?: string
          redirect_to?: string | null
          scan_id?: string
          severity?: string
          source_page?: string | null
          status_code?: number | null
          suggestion?: string | null
          type?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "link_scan_results_scan_id_fkey"
            columns: ["scan_id"]
            isOneToOne: false
            referencedRelation: "link_scans"
            referencedColumns: ["id"]
          },
        ]
      }
      link_scans: {
        Row: {
          critical_count: number
          finished_at: string | null
          id: string
          info_count: number
          ok_count: number
          started_at: string
          started_by: string | null
          status: string
          total_links: number
          warning_count: number
        }
        Insert: {
          critical_count?: number
          finished_at?: string | null
          id?: string
          info_count?: number
          ok_count?: number
          started_at?: string
          started_by?: string | null
          status?: string
          total_links?: number
          warning_count?: number
        }
        Update: {
          critical_count?: number
          finished_at?: string | null
          id?: string
          info_count?: number
          ok_count?: number
          started_at?: string
          started_by?: string | null
          status?: string
          total_links?: number
          warning_count?: number
        }
        Relationships: []
      }
      listing_photos: {
        Row: {
          created_at: string
          id: string
          image_url: string
          listing_id: string
          sort_order: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          image_url: string
          listing_id: string
          sort_order?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string
          listing_id?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "listing_photos_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      listings: {
        Row: {
          accepted_exchange_types: string[]
          autonomy_level: string | null
          availability_notes: string | null
          available: boolean | null
          capacity: number | null
          collective_access: string | null
          collective_relationship: Database["public"]["Enums"]["collective_relationship"]
          conditions: string | null
          created_at: string
          description: string | null
          faq: Json | null
          highlights: string[] | null
          host_id: string
          id: string
          image: string | null
          images: string[] | null
          interaction_level: string | null
          listing_type: Database["public"]["Enums"]["listing_type"]
          place_id: string
          points_per_night: number | null
          practical_rules: string[] | null
          published: boolean | null
          slug: string | null
          title: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          accepted_exchange_types?: string[] | null
          autonomy_level?: string | null
          availability_notes?: string | null
          available?: boolean | null
          capacity?: number | null
          collective_access?: string | null
          collective_relationship?: Database["public"]["Enums"]["collective_relationship"]
          conditions?: string | null
          created_at?: string
          description?: string | null
          faq?: Json | null
          highlights?: string[] | null
          host_id: string
          id?: string
          image?: string | null
          images?: string[] | null
          interaction_level?: string | null
          listing_type?: Database["public"]["Enums"]["listing_type"]
          place_id: string
          points_per_night?: number | null
          practical_rules?: string[] | null
          published?: boolean | null
          slug?: string | null
          title: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          accepted_exchange_types?: string[] | null
          autonomy_level?: string | null
          availability_notes?: string | null
          available?: boolean | null
          capacity?: number | null
          collective_access?: string | null
          collective_relationship?: Database["public"]["Enums"]["collective_relationship"]
          conditions?: string | null
          created_at?: string
          description?: string | null
          faq?: Json | null
          highlights?: string[] | null
          host_id?: string
          id?: string
          image?: string | null
          images?: string[] | null
          interaction_level?: string | null
          listing_type?: Database["public"]["Enums"]["listing_type"]
          place_id?: string
          points_per_night?: number | null
          practical_rules?: string[] | null
          published?: boolean | null
          slug?: string | null
          title?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "listings_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          sender_user_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          sender_user_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          sender_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      place_claim_requests: {
        Row: {
          created_at: string
          email: string
          email_verified: boolean
          email_verified_at: string | null
          full_name: string
          id: string
          message: string | null
          place_id: string
          proof_url: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          role_in_place: string
          status: string
          token_expires_at: string | null
          user_id: string
          verification_token: string | null
        }
        Insert: {
          created_at?: string
          email: string
          email_verified?: boolean
          email_verified_at?: string | null
          full_name: string
          id?: string
          message?: string | null
          place_id: string
          proof_url?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          role_in_place: string
          status?: string
          token_expires_at?: string | null
          user_id: string
          verification_token?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          email_verified?: boolean
          email_verified_at?: string | null
          full_name?: string
          id?: string
          message?: string | null
          place_id?: string
          proof_url?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          role_in_place?: string
          status?: string
          token_expires_at?: string | null
          user_id?: string
          verification_token?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "place_claim_requests_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
        ]
      }
      place_claims: {
        Row: {
          created_at: string
          id: string
          message: string
          place_id: string
          proof_url: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          place_id: string
          proof_url?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          place_id?: string
          proof_url?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "place_claims_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
        ]
      }
      place_members: {
        Row: {
          id: string
          joined_at: string
          place_id: string
          relationship_to_place: string | null
          role: string | null
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string
          place_id: string
          relationship_to_place?: string | null
          role?: string | null
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string
          place_id?: string
          relationship_to_place?: string | null
          role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "place_members_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
        ]
      }
      places: {
        Row: {
          accessible: boolean | null
          address_text: string | null
          ambiance: string | null
          animals_allowed: boolean | null
          children_friendly: boolean | null
          city: string | null
          claim_status: string
          claimed_at: string | null
          claimed_by_user_id: string | null
          contact_enabled: boolean
          country: string | null
          created_at: string
          created_by: string
          description: string | null
          diet: string | null
          environment_type: string | null
          family_friendly: boolean | null
          governance: string | null
          hospitality_managed_by: string | null
          hospitality_manager: string | null
          hospitality_types: string[] | null
          hosting_status: string | null
          hosting_style: string | null
          house_rules: string[] | null
          id: string
          image: string | null
          images: string[] | null
          inhabitants: number | null
          is_imported: boolean
          is_visible: boolean
          name: string
          offerings: string[] | null
          participatory_stay: boolean | null
          published: boolean | null
          region: string | null
          shared_amenities: string[] | null
          short_desc: string | null
          slug: string | null
          solo_friendly: boolean | null
          tags: string[] | null
          type: string
          updated_at: string
          values: string[] | null
          vibe: string | null
          video_url: string | null
          website: string | null
          year_founded: number | null
        }
        Insert: {
          accessible?: boolean | null
          address_text?: string | null
          ambiance?: string | null
          animals_allowed?: boolean | null
          children_friendly?: boolean | null
          city?: string | null
          claim_status?: string
          claimed_at?: string | null
          claimed_by_user_id?: string | null
          contact_enabled?: boolean
          country?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          diet?: string | null
          environment_type?: string | null
          family_friendly?: boolean | null
          governance?: string | null
          hospitality_managed_by?: string | null
          hospitality_manager?: string | null
          hospitality_types?: string[] | null
          hosting_status?: string | null
          hosting_style?: string | null
          house_rules?: string[] | null
          id?: string
          image?: string | null
          images?: string[] | null
          inhabitants?: number | null
          is_imported?: boolean
          is_visible?: boolean
          name: string
          offerings?: string[] | null
          participatory_stay?: boolean | null
          published?: boolean | null
          region?: string | null
          shared_amenities?: string[] | null
          short_desc?: string | null
          slug?: string | null
          solo_friendly?: boolean | null
          tags?: string[] | null
          type: string
          updated_at?: string
          values?: string[] | null
          vibe?: string | null
          video_url?: string | null
          website?: string | null
          year_founded?: number | null
        }
        Update: {
          accessible?: boolean | null
          address_text?: string | null
          ambiance?: string | null
          animals_allowed?: boolean | null
          children_friendly?: boolean | null
          city?: string | null
          claim_status?: string
          claimed_at?: string | null
          claimed_by_user_id?: string | null
          contact_enabled?: boolean
          country?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          diet?: string | null
          environment_type?: string | null
          family_friendly?: boolean | null
          governance?: string | null
          hospitality_managed_by?: string | null
          hospitality_manager?: string | null
          hospitality_types?: string[] | null
          hosting_status?: string | null
          hosting_style?: string | null
          house_rules?: string[] | null
          id?: string
          image?: string | null
          images?: string[] | null
          inhabitants?: number | null
          is_imported?: boolean
          is_visible?: boolean
          name?: string
          offerings?: string[] | null
          participatory_stay?: boolean | null
          published?: boolean | null
          region?: string | null
          shared_amenities?: string[] | null
          short_desc?: string | null
          slug?: string | null
          solo_friendly?: boolean | null
          tags?: string[] | null
          type?: string
          updated_at?: string
          values?: string[] | null
          vibe?: string | null
          video_url?: string | null
          website?: string | null
          year_founded?: number | null
        }
        Relationships: []
      }
      point_balances: {
        Row: {
          balance: number
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      point_transactions: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          id: string
          related_id: string | null
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          id?: string
          related_id?: string | null
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          related_id?: string | null
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          collective_experience: string | null
          created_at: string
          display_name: string
          email_settings: Json
          hosting_style: string | null
          id: string
          languages: string[] | null
          newsletter_opt_in: boolean
          reminder_sent_at: string | null
          updated_at: string
          user_id: string
          weekly_digest_last_sent_at: string | null
          welcome_email_sent_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          collective_experience?: string | null
          created_at?: string
          display_name: string
          email_settings?: Json
          hosting_style?: string | null
          id?: string
          languages?: string[] | null
          newsletter_opt_in?: boolean
          reminder_sent_at?: string | null
          updated_at?: string
          user_id: string
          weekly_digest_last_sent_at?: string | null
          welcome_email_sent_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          collective_experience?: string | null
          created_at?: string
          display_name?: string
          email_settings?: Json
          hosting_style?: string | null
          id?: string
          languages?: string[] | null
          newsletter_opt_in?: boolean
          reminder_sent_at?: string | null
          updated_at?: string
          user_id?: string
          weekly_digest_last_sent_at?: string | null
          welcome_email_sent_at?: string | null
        }
        Relationships: []
      }
      referral_rewards: {
        Row: {
          claimed_at: string
          expires_at: string | null
          id: string
          metadata: Json | null
          referral_count: number
          reward_type: string
          user_id: string
        }
        Insert: {
          claimed_at?: string
          expires_at?: string | null
          id?: string
          metadata?: Json | null
          referral_count: number
          reward_type: string
          user_id: string
        }
        Update: {
          claimed_at?: string
          expires_at?: string | null
          id?: string
          metadata?: Json | null
          referral_count?: number
          reward_type?: string
          user_id?: string
        }
        Relationships: []
      }
      referrals: {
        Row: {
          code: string
          completed_at: string | null
          created_at: string
          email_sent: boolean
          email_sent_at: string | null
          id: string
          referred_email: string | null
          referred_user_id: string | null
          referrer_user_id: string
          status: string
        }
        Insert: {
          code: string
          completed_at?: string | null
          created_at?: string
          email_sent?: boolean
          email_sent_at?: string | null
          id?: string
          referred_email?: string | null
          referred_user_id?: string | null
          referrer_user_id: string
          status?: string
        }
        Update: {
          code?: string
          completed_at?: string | null
          created_at?: string
          email_sent?: boolean
          email_sent_at?: string | null
          id?: string
          referred_email?: string | null
          referred_user_id?: string | null
          referrer_user_id?: string
          status?: string
        }
        Relationships: []
      }
      resources: {
        Row: {
          author_or_director: string | null
          cover_image: string | null
          created_at: string
          description: string | null
          external_link: string | null
          id: string
          is_published: boolean
          slug: string
          tags: string[] | null
          title: string
          type: string
          year: number | null
        }
        Insert: {
          author_or_director?: string | null
          cover_image?: string | null
          created_at?: string
          description?: string | null
          external_link?: string | null
          id?: string
          is_published?: boolean
          slug: string
          tags?: string[] | null
          title: string
          type: string
          year?: number | null
        }
        Update: {
          author_or_director?: string | null
          cover_image?: string | null
          created_at?: string
          description?: string | null
          external_link?: string | null
          id?: string
          is_published?: boolean
          slug?: string
          tags?: string[] | null
          title?: string
          type?: string
          year?: number | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          author_user_id: string
          clarity_rating: number | null
          collective_experience_rating: number | null
          created_at: string
          hospitality_rating: number | null
          id: string
          listing_id: string
          review_text: string | null
          target_member_id: string
        }
        Insert: {
          author_user_id: string
          clarity_rating?: number | null
          collective_experience_rating?: number | null
          created_at?: string
          hospitality_rating?: number | null
          id?: string
          listing_id: string
          review_text?: string | null
          target_member_id: string
        }
        Update: {
          author_user_id?: string
          clarity_rating?: number | null
          collective_experience_rating?: number | null
          created_at?: string
          hospitality_rating?: number | null
          id?: string
          listing_id?: string
          review_text?: string | null
          target_member_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      shared_wishlists: {
        Row: {
          created_at: string
          id: string
          title: string | null
          token: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          title?: string | null
          token?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          title?: string | null
          token?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      stay_reviews: {
        Row: {
          approved_at: string | null
          approved_by_habitat: boolean
          created_at: string
          id: string
          is_public: boolean
          listing_id: string | null
          moderation_note: string | null
          photos_urls: string[]
          place_id: string
          rating: number | null
          stay_request_id: string | null
          text: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          approved_at?: string | null
          approved_by_habitat?: boolean
          created_at?: string
          id?: string
          is_public?: boolean
          listing_id?: string | null
          moderation_note?: string | null
          photos_urls?: string[]
          place_id: string
          rating?: number | null
          stay_request_id?: string | null
          text?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          approved_at?: string | null
          approved_by_habitat?: boolean
          created_at?: string
          id?: string
          is_public?: boolean
          listing_id?: string | null
          moderation_note?: string | null
          photos_urls?: string[]
          place_id?: string
          rating?: number | null
          stay_request_id?: string | null
          text?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          created_at: string
          desired_stay_duration: string | null
          id: string
          preferred_habitat_types: string[]
          preferred_regions: string[]
          preferred_values: string[]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          desired_stay_duration?: string | null
          id?: string
          preferred_habitat_types?: string[]
          preferred_regions?: string[]
          preferred_values?: string[]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          desired_stay_duration?: string | null
          id?: string
          preferred_habitat_types?: string[]
          preferred_regions?: string[]
          preferred_values?: string[]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_points: {
        Args: {
          _amount: number
          _description?: string
          _related_id?: string
          _type: string
          _user_id: string
        }
        Returns: undefined
      }
      admin_merge_places: {
        Args: { _source_id: string; _target_id: string }
        Returns: undefined
      }
      claim_referral: { Args: { _code: string }; Returns: Json }
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      get_popular_places: {
        Args: { _days?: number; _limit?: number }
        Returns: {
          favorite_count: number
          image: string
          name: string
          place_id: string
          region: string
          view_count: number
        }[]
      }
      get_public_stats: { Args: never; Returns: Json }
      get_region_distribution: {
        Args: never
        Returns: {
          count: number
          region: string
        }[]
      }
      get_value_search_stats: {
        Args: never
        Returns: {
          count: number
          value: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_conversation_participant: {
        Args: { _conversation_id: string; _user_id: string }
        Returns: boolean
      }
      is_place_manager: {
        Args: { _place_id: string; _user_id: string }
        Returns: boolean
      }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
      verify_claim_token: { Args: { _token: string }; Returns: Json }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      collective_relationship:
        | "personal"
        | "known_by_collective"
        | "collective_supported"
        | "collective_run"
      listing_type:
        | "home_exchange"
        | "private_room"
        | "guest_room"
        | "immersion_stay"
        | "hosted_stay"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
      collective_relationship: [
        "personal",
        "known_by_collective",
        "collective_supported",
        "collective_run",
      ],
      listing_type: [
        "home_exchange",
        "private_room",
        "guest_room",
        "immersion_stay",
        "hosted_stay",
      ],
    },
  },
} as const
