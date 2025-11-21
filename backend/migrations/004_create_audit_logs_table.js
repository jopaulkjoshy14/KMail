exports.up = function(knex) {
  return knex.schema.createTable('audit_logs', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.string('action').notNullable(); // e.g., 'SEND_MESSAGE', 'LOGIN', 'ROTATE_KEYS'
    table.string('resource_type').notNullable(); // e.g., 'message', 'user', 'keys'
    table.string('resource_id').notNullable(); // ID of the resource
    table.jsonb('details'); // Additional details about the action
    table.timestamp('created_at').defaultTo(knex.fn.now());
    
    // Indexes
    table.index('user_id');
    table.index('action');
    table.index('resource_type');
    table.index('created_at');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('audit_logs');
};
