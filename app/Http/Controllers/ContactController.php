<?php

namespace App\Http\Controllers;

use App\Models\Contact;
use App\Models\ContactGroup;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ContactController extends Controller
{
    public function index(Request $request): Response
    {
        $contacts = Contact::query()
            ->with('groups:id,name')
            ->when($request->string('search'), function ($query, string $search) {
                $query->where(function ($inner) use ($search) {
                    $inner
                        ->where('name', 'like', "%{$search}%")
                        ->orWhere('phone_number', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->orderByDesc('created_at')
            ->paginate(15)
            ->withQueryString();

        $groups = ContactGroup::orderBy('name')->get(['id', 'name']);

        return Inertia::render('contacts/index', [
            'contacts' => $contacts,
            'groups' => $groups,
            'filters' => [
                'search' => $request->string('search')->toString(),
            ],
        ]);
    }

    public function create(): Response
    {
        $groups = ContactGroup::orderBy('name')->get(['id', 'name']);

        return Inertia::render('contacts/create', [
            'groups' => $groups,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'phone_number' => ['required', 'string', 'max:50'],
            'email' => ['nullable', 'email', 'max:255'],
            'tags' => ['nullable', 'array'],
            'tags.*' => ['string', 'max:50'],
            'status' => ['required', Rule::in(['active', 'inactive'])],
            'group_ids' => ['nullable', 'array'],
            'group_ids.*' => ['integer', 'exists:contact_groups,id'],
        ]);

        $contact = Contact::create([
            'name' => $validated['name'],
            'phone_number' => $validated['phone_number'],
            'email' => $validated['email'] ?? null,
            'tags' => $validated['tags'] ?? [],
            'status' => $validated['status'],
        ]);

        if (! empty($validated['group_ids'])) {
            $contact->groups()->sync($validated['group_ids']);
        }

        return redirect()
            ->route('contacts.index')
            ->with('success', 'Contact created successfully.');
    }

    public function edit(Contact $contact): Response
    {
        $contact->load('groups:id,name');
        $groups = ContactGroup::orderBy('name')->get(['id', 'name']);

        return Inertia::render('contacts/edit', [
            'contact' => $contact,
            'groups' => $groups,
        ]);
    }

    public function update(Request $request, Contact $contact): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'phone_number' => ['required', 'string', 'max:50'],
            'email' => ['nullable', 'email', 'max:255'],
            'tags' => ['nullable', 'array'],
            'tags.*' => ['string', 'max:50'],
            'status' => ['required', Rule::in(['active', 'inactive'])],
            'group_ids' => ['nullable', 'array'],
            'group_ids.*' => ['integer', 'exists:contact_groups,id'],
        ]);

        $contact->update([
            'name' => $validated['name'],
            'phone_number' => $validated['phone_number'],
            'email' => $validated['email'] ?? null,
            'tags' => $validated['tags'] ?? [],
            'status' => $validated['status'],
        ]);

        $contact->groups()->sync($validated['group_ids'] ?? []);

        return redirect()
            ->route('contacts.index')
            ->with('success', 'Contact updated successfully.');
    }

    public function destroy(Contact $contact): RedirectResponse
    {
        $contact->delete();

        return redirect()
            ->route('contacts.index')
            ->with('success', 'Contact deleted successfully.');
    }

    public function importForm(): Response
    {
        $groups = ContactGroup::orderBy('name')->get(['id', 'name']);

        return Inertia::render('contacts/import', [
            'groups' => $groups,
        ]);
    }

    public function import(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'file' => ['required', 'file', 'mimes:csv,txt'],
            'status' => ['nullable', Rule::in(['active', 'inactive'])],
            'group_ids' => ['nullable', 'array'],
            'group_ids.*' => ['integer', 'exists:contact_groups,id'],
        ]);

        $handle = fopen($validated['file']->getRealPath(), 'r');

        if (! $handle) {
            return back()->withErrors(['file' => 'Unable to read the uploaded file.']);
        }

        // Expect header row: name,phone_number,email,tags,status
        $header = fgetcsv($handle);

        while (($row = fgetcsv($handle)) !== false) {
            $data = array_combine($header, $row);

            if (! $data || empty($data['phone_number'])) {
                continue;
            }

            $tags = [];
            if (! empty($data['tags'])) {
                $tags = array_values(array_filter(array_map('trim', explode(',', $data['tags']))));
            }

            $status = $validated['status'] ?? ($data['status'] ?? 'active');

            $contact = Contact::updateOrCreate(
                ['phone_number' => $data['phone_number']],
                [
                    'name' => $data['name'] ?? $data['phone_number'],
                    'email' => $data['email'] ?? null,
                    'tags' => $tags,
                    'status' => in_array($status, ['active', 'inactive'], true) ? $status : 'active',
                ],
            );

            if (! empty($validated['group_ids'])) {
                $contact->groups()->syncWithoutDetaching($validated['group_ids']);
            }
        }

        fclose($handle);

        return redirect()
            ->route('contacts.index')
            ->with('success', 'Contacts imported successfully.');
    }
}


