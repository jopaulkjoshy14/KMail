exports.up = function(knex) {
  return knex.schema.createTable('key_rotation_history', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.string('algorithm').notNullable(); // 'kyber', 'dilithium'
    table.timestamp('rotated_at').defaultTo(knex.fn.now());
    
    // Indexes
    table.index('user_id');
    table.index('rotated_at');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('key_rotation_history');
};
