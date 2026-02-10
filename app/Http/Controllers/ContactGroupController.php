<?php

namespace App\Http\Controllers;

use App\Models\ContactGroup;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ContactGroupController extends Controller
{
    public function index(): Response
    {
        $groups = ContactGroup::withCount('contacts')
            ->orderBy('name')
            ->paginate(15);

        return Inertia::render('contact-groups/index', [
            'groups' => $groups,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('contact-groups/create');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
        ]);

        ContactGroup::create($validated);

        return redirect()
            ->route('contact-groups.index')
            ->with('success', 'Contact group created successfully.');
    }

    public function edit(ContactGroup $contactGroup): Response
    {
        return Inertia::render('contact-groups/edit', [
            'group' => $contactGroup,
        ]);
    }

    public function update(Request $request, ContactGroup $contactGroup): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
        ]);

        $contactGroup->update($validated);

        return redirect()
            ->route('contact-groups.index')
            ->with('success', 'Contact group updated successfully.');
    }

    public function destroy(ContactGroup $contactGroup): RedirectResponse
    {
        $contactGroup->delete();

        return redirect()
            ->route('contact-groups.index')
            ->with('success', 'Contact group deleted successfully.');
    }
}


