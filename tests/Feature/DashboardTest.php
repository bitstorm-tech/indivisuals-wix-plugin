<?php

use App\Models\User;

test('guests are redirected to the login page', function () {
    $this->get('/admin')->assertRedirect('/login');
});

test('authenticated users can visit the prompts', function () {
    $this->actingAs($user = User::factory()->create());

    $this->get('/prompts')->assertOk();
});
