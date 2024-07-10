<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->decimal('balance', 7, 2);
        });

        DB::statement('
            UPDATE
                orders, (
                    SELECT order_id, SUM(amount) amount
                    FROM
                        (
                            SELECT t.order_id, -g.price - g.fee AS amount
                            FROM tickets t JOIN ticketgroups g ON t.ticketgroup_id = g.id
                            WHERE t.is_valid = 1 AND t.is_revoked = 0
                            UNION ALL
                            SELECT order_id, amount AS amount
                            FROM payments
                        ) ref
                    GROUP BY order_id
                ) amounts
            SET orders.balance = amounts.amount
            WHERE orders.id = amounts.order_id');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn('balance');
        });
    }
};
