exports.up = function(knex) {
  return knex.schema.createTable('users', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('email').unique().notNullable();
    table.string('password_hash').notNullable();
    table.string('name').notNullable();
    
    // Quantum-resistant keys
    table.binary('kyber_public_key').notNullable();
    table.binary('kyber_private_key').notNullable();
    table.binary('dilithium_public_key').notNullable();
    table.binary('dilithium_private_key').notNullable();
    
    // Timestamps
    table.timestamp('key_rotated_at').defaultTo(knex.fn.now());
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    // Indexes
    table.index('email');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('users');
};
