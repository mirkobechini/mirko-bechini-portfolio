<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            $table->string('github_repo')->unique();
            $table->string('title');
            $table->text('description_it')->nullable();
            $table->string('type')->default('fullstack');
            $table->string('scope')->default('personal');
            $table->json('technologies')->nullable();
            $table->json('extra_technologies')->nullable();
            $table->string('repo_url');
            $table->string('live_url')->nullable();
            $table->unsignedInteger('stars')->default(0);
            $table->timestamp('pushed_at')->nullable();
            $table->boolean('pinned')->default(false);
            $table->boolean('hidden')->default(false);
            $table->timestamp('synced_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('projects');
    }
};
