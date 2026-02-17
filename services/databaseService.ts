import { supabase } from './supabaseClient';
import { Business, Customer } from '../types';

// ==================== BUSINESSES ====================

export const getAllBusinesses = async (): Promise<Business[]> => {
    const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching businesses:', error);
        return [];
    }

    return data.map(transformBusinessFromDB);
};

export const getBusinessById = async (id: string): Promise<Business | null> => {
    const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        console.error('Error fetching business:', error);
        return null;
    }

    return transformBusinessFromDB(data);
};

export const createBusiness = async (business: Business): Promise<Business | null> => {
    const dbBusiness = transformBusinessToDB(business);

    const { data, error } = await supabase
        .from('businesses')
        .insert([dbBusiness])
        .select()
        .single();

    if (error) {
        console.error('Error creating business:', error);
        return null;
    }

    return transformBusinessFromDB(data);
};

export const updateBusiness = async (business: Business): Promise<Business | null> => {
    const dbBusiness = transformBusinessToDB(business);

    // Remove ID and created_at from update payload to avoid primary key/immutable field errors
    const { id, created_at, ...updateData } = dbBusiness;

    const { data, error } = await supabase
        .from('businesses')
        .update(updateData)
        .eq('id', business.id)
        .select()
        .single();

    if (error) {
        console.error('Error updating business:', error);
        return null;
    }

    return transformBusinessFromDB(data);
};

export const deleteBusiness = async (id: string): Promise<boolean> => {
    const { error } = await supabase
        .from('businesses')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting business:', error);
        return false;
    }

    return true;
};

export const incrementBusinessViews = async (id: string): Promise<void> => {
    const { error } = await supabase.rpc('increment_views', { business_id: id });

    if (error) {
        // Fallback: manual increment
        const { data: business } = await supabase
            .from('businesses')
            .select('views')
            .eq('id', id)
            .single();

        if (business) {
            await supabase
                .from('businesses')
                .update({ views: (business.views || 0) + 1 })
                .eq('id', id);
        }
    }
};

// ==================== CUSTOMERS ====================

export const getAllCustomers = async (): Promise<Customer[]> => {
    const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching customers:', error);
        return [];
    }

    return data.map(transformCustomerFromDB);
};

export const createCustomer = async (customer: Customer): Promise<Customer | null> => {
    const dbCustomer = {
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        neighborhood: customer.neighborhood,
    };

    const { data, error } = await supabase
        .from('customers')
        .insert([dbCustomer])
        .select()
        .single();

    if (error) {
        console.error('Error creating customer:', error);
        return null;
    }

    return transformCustomerFromDB(data);
};

export const getCustomerById = async (id: string): Promise<Customer | null> => {
    const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        console.error('Error fetching customer:', error);
        return null;
    }

    return transformCustomerFromDB(data);
};

// ==================== ADMIN SESSIONS ====================

export const checkAdminSession = async (): Promise<boolean> => {
    const { data, error } = await supabase
        .from('admin_sessions')
        .select('*')
        .eq('is_logged', true)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

    if (error || !data) {
        return false;
    }

    return true;
};

export const createAdminSession = async (): Promise<boolean> => {
    // First, clear all existing sessions
    await supabase
        .from('admin_sessions')
        .update({ is_logged: false })
        .eq('is_logged', true);

    // Create new session
    const { error } = await supabase
        .from('admin_sessions')
        .insert([{ is_logged: true }]);

    if (error) {
        console.error('Error creating admin session:', error);
        return false;
    }

    return true;
};

export const clearAdminSession = async (): Promise<boolean> => {
    const { error } = await supabase
        .from('admin_sessions')
        .update({ is_logged: false })
        .eq('is_logged', true);

    if (error) {
        console.error('Error clearing admin session:', error);
        return false;
    }

    return true;
};

// ==================== MERCHANT SESSIONS ====================

export const getMerchantSession = async (): Promise<string | null> => {
    const { data, error } = await supabase
        .from('merchant_sessions')
        .select('business_id')
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

    if (error || !data) {
        return null;
    }

    return data.business_id;
};

export const createMerchantSession = async (businessId: string): Promise<boolean> => {
    // Clear existing sessions
    await supabase
        .from('merchant_sessions')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    // Create new session
    const { error } = await supabase
        .from('merchant_sessions')
        .insert([{ business_id: businessId }]);

    if (error) {
        console.error('Error creating merchant session:', error);
        return false;
    }

    return true;
};

export const clearMerchantSession = async (): Promise<boolean> => {
    const { error } = await supabase
        .from('merchant_sessions')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (error) {
        console.error('Error clearing merchant session:', error);
        return false;
    }

    return true;
};

// ==================== HELPER FUNCTIONS ====================

function transformBusinessFromDB(data: any): Business {
    return {
        id: data.id,
        code: data.code,
        name: data.name,
        username: data.username,
        description: data.description,
        category: data.category,
        segment: data.segment || '',
        address: data.address,
        street: data.street,
        number: data.number,
        neighborhood: data.neighborhood,
        cep: data.cep,
        phone: data.phone,
        password: data.password,
        imageUrl: data.image_url,
        logoUrl: data.logo_url,
        isOpen: data.is_open,
        isActive: data.is_active,
        isOfficial: data.is_official,
        schedule: data.schedule,
        businessHours: data.business_hours,
        offersDelivery: data.offers_delivery,
        offersPickup: data.offers_pickup,
        rating: data.rating || 0,
        reviewsCount: data.reviews_count || 0,
        googleMapsLink: data.google_maps_link || '',
        views: data.views || 0,
        createdAt: new Date(data.created_at).getTime(),
    };
}

function transformBusinessToDB(business: Business): any {
    return {
        id: business.id,
        code: business.code,
        name: business.name,
        username: business.username,
        description: business.description,
        category: business.category,
        segment: business.segment || '',
        address: business.address,
        street: business.street,
        number: business.number,
        neighborhood: business.neighborhood,
        cep: business.cep,
        phone: business.phone,
        password: business.password,
        image_url: business.imageUrl,
        logo_url: business.logoUrl,
        is_open: business.isOpen,
        is_active: business.isActive,
        is_official: business.isOfficial,
        schedule: business.schedule,
        business_hours: business.businessHours,
        offers_delivery: business.offersDelivery,
        offers_pickup: business.offersPickup,
        rating: business.rating || 0,
        reviews_count: business.reviewsCount || 0,
        google_maps_link: business.googleMapsLink || '',
        views: business.views || 0,
    };
}

function transformCustomerFromDB(data: any): Customer {
    return {
        id: data.id,
        name: data.name,
        phone: data.phone,
        neighborhood: data.neighborhood,
        createdAt: new Date(data.created_at).getTime(),
    };
}
