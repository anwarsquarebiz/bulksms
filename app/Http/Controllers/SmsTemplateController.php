<?php

namespace App\Http\Controllers;

use App\Models\SmsTemplate;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SmsTemplateController extends Controller
{
    public function index()
    {
        $templates = SmsTemplate::where('user_id', auth()->id())
            ->latest()
            ->paginate(20);

        return Inertia::render('sms-templates/index', [
            'templates' => $templates,
        ]);
    }

    public function create()
    {
        return Inertia::render('sms-templates/create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'message' => 'required|string|max:1600',
        ]);

        SmsTemplate::create([
            'user_id' => auth()->id(),
            'name' => $validated['name'],
            'message' => $validated['message'],
        ]);

        return redirect()->route('sms-templates.index')
            ->with('success', 'Template created successfully');
    }

    public function edit(SmsTemplate $smsTemplate)
    {
        if ($smsTemplate->user_id !== auth()->id()) {
            abort(403);
        }

        return Inertia::render('sms-templates/edit', [
            'template' => $smsTemplate,
        ]);
    }

    public function update(Request $request, SmsTemplate $smsTemplate)
    {
        if ($smsTemplate->user_id !== auth()->id()) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'message' => 'required|string|max:1600',
        ]);

        $smsTemplate->update($validated);

        return redirect()->route('sms-templates.index')
            ->with('success', 'Template updated successfully');
    }

    public function destroy(SmsTemplate $smsTemplate)
    {
        if ($smsTemplate->user_id !== auth()->id()) {
            abort(403);
        }

        $smsTemplate->delete();

        return redirect()->route('sms-templates.index')
            ->with('success', 'Template deleted successfully');
    }
}

