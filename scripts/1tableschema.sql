-- Create the database if it doesn't already exist
CREATE DATABASE exampledb;

-- Connect to the newly created database
use exampledb;


CREATE TABLE IF NOT EXISTS users
(
    user_id uuid NOT NULL,
    email character varying(255) COLLATE pg_catalog."default" NOT NULL,
    password_hash text COLLATE pg_catalog."default" NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    last_login timestamp without time zone,
    CONSTRAINT users_pkey PRIMARY KEY (user_id),
    CONSTRAINT users_email_key UNIQUE (email)
)

CREATE TABLE IF NOT EXISTS forgot_password (
    user_email character varying(255) COLLATE pg_catalog."default" NOT NULL,  -- Reference to the useremail
    reset_token TEXT NOT NULL,          -- Secure token for password reset
    reset_token_expiry TIMESTAMP NOT NULL, -- Expiration time for the token
    created_at TIMESTAMP DEFAULT NOW(), -- Timestamp of record creation
    updated_at TIMESTAMP DEFAULT NOW() -- Timestamp of last update
);

TABLESPACE pg_default;

ALTER TABLE IF EXISTS users
    OWNER to example;

-- Table: user_roles
CREATE TABLE IF NOT EXISTS user_roles
(
    role_id UUID NOT NULL,
    role_name character varying(50) COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT user_roles_pkey PRIMARY KEY (role_id),
    CONSTRAINT user_roles_role_name_key UNIQUE (role_name)
);

-- Table: user_profiles
CREATE TABLE IF NOT EXISTS user_profiles
(
    profile_id UUID NOT NULL,
    user_id UUID NOT NULL,
    first_name character varying(100) COLLATE pg_catalog."default",
    last_name character varying(100) COLLATE pg_catalog."default",
    avatar_url text COLLATE pg_catalog."default",
    bio text COLLATE pg_catalog."default",
    preferences jsonb DEFAULT '{}'::jsonb,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT user_profiles_pkey PRIMARY KEY (profile_id),
    CONSTRAINT user_profiles_user_id_fkey FOREIGN KEY (user_id)
        REFERENCES users (user_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
);

-- Table: user_role_assignments
CREATE TABLE IF NOT EXISTS user_role_assignments
(
    assignment_id UUID NOT NULL,
    user_id UUID NOT NULL,
    role_id UUID NOT NULL,
    assigned_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT user_role_assignments_pkey PRIMARY KEY (assignment_id),
    CONSTRAINT user_role_assignments_user_id_fkey FOREIGN KEY (user_id)
        REFERENCES users (user_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE,
    CONSTRAINT user_role_assignments_role_id_fkey FOREIGN KEY (role_id)
        REFERENCES user_roles (role_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
);

-- Table: user_social_auth
CREATE TABLE IF NOT EXISTS user_social_auth
(
    social_auth_id UUID NOT NULL,
    user_id UUID NOT NULL,
    auth_provider character varying(100) COLLATE pg_catalog."default",
    provider_id character varying(255) COLLATE pg_catalog."default",
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT user_social_auth_pkey PRIMARY KEY (social_auth_id),
    CONSTRAINT user_social_auth_user_id_fkey FOREIGN KEY (user_id)
        REFERENCES users (user_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
);

-- Table: inventory
CREATE TABLE IF NOT EXISTS inventory
(
    product_id UUID NOT NULL,
    product_name character varying(255) COLLATE pg_catalog."default" NOT NULL,
    product_description text COLLATE pg_catalog."default",
    price numeric(10,2) NOT NULL,
    stock_quantity integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT inventory_pkey PRIMARY KEY (product_id)
);

-- Table: inventory_transactions
CREATE TABLE IF NOT EXISTS inventory_transactions
(
    transaction_id UUID NOT NULL,
    product_id UUID NOT NULL,
    transaction_type character varying(50) COLLATE pg_catalog."default" NOT NULL,
    quantity integer NOT NULL,
    transaction_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    notes text COLLATE pg_catalog."default",
    CONSTRAINT inventory_transactions_pkey PRIMARY KEY (transaction_id),
    CONSTRAINT inventory_transactions_product_id_fkey FOREIGN KEY (product_id)
        REFERENCES inventory (product_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
);

-- Table: orders
CREATE TABLE IF NOT EXISTS orders
(
    order_id UUID NOT NULL,
    user_id UUID NOT NULL,
    order_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    status character varying(50) COLLATE pg_catalog."default" DEFAULT 'pending'::character varying,
    total_amount numeric(10,2) NOT NULL,
    shipping_address jsonb,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT orders_pkey PRIMARY KEY (order_id),
    CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id)
        REFERENCES users (user_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
);

ALTER TABLE orders
ADD COLUMN notes text NOT NULL DEFAULT '';

-- Table: order_items
CREATE TABLE IF NOT EXISTS order_items
(
    order_item_id UUID NOT NULL,
    order_id UUID NOT NULL,
    product_id UUID NOT NULL,
    quantity integer NOT NULL,
    unit_price numeric(10,2) NOT NULL,
    total_price numeric(10,2) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT order_items_pkey PRIMARY KEY (order_item_id),
    CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id)
        REFERENCES orders (order_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE,
    CONSTRAINT order_items_product_id_fkey FOREIGN KEY (product_id)
        REFERENCES inventory (product_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
);

ALTER TABLE order_items
ADD COLUMN notes text NOT NULL DEFAULT '';

-- Table: order_payments
CREATE TABLE IF NOT EXISTS order_payments
(
    payment_id UUID NOT NULL,
    order_id UUID NOT NULL,
    payment_method character varying(50) COLLATE pg_catalog."default",
    payment_status character varying(50) COLLATE pg_catalog."default" DEFAULT 'pending'::character varying,
    payment_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    amount numeric(10,2) NOT NULL,
    CONSTRAINT order_payments_pkey PRIMARY KEY (payment_id),
    CONSTRAINT order_payments_order_id_fkey FOREIGN KEY (order_id)
        REFERENCES orders (order_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
);
