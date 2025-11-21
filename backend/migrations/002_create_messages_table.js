exports.up = function(knex) {
  return knex.schema.createTable('messages', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    
    // Foreign keys
    table.uuid('sender_id').references('id').inTable('users').onDelete('CASCADE');
    table.uuid('recipient_id').references('id').inTable('users').onDelete('CASCADE');
    
    // Message content (encrypted)
    table.string('subject');
    table.binary('encrypted_content').notNullable();
    table.binary('encryption_nonce').notNullable();
    table.binary('encryption_auth_tag').notNullable();
    
    // Quantum cryptography data
    table.binary('ephemeral_public_key');
    table.binary('kyber_ciphertext').notNullable();
    table.binary('signature').notNullable();
    
    // Message status
    table.boolean('is_read').defaultTo(false);
    table.timestamp('read_at');
    
    // Timestamps
    table.timestamp('created_at').defaultTo(knex.fn.now());
    
    // Indexes
    table.index('sender_id');
    table.index('recipient_id');
    table.index('created_at');
    table.index(['recipient_id', 'is_read']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('messages');
};
