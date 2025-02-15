from django.shortcuts import render
import random
from . import util


def index(request):

    return render(request, "encyclopedia/index.html", {
        "entries": util.list_entries()
    })


def entry_page(request, entry_name):

    selected_entry = entry_name

    markdown_text = util.get_entry(selected_entry)
    html_text = util.convert_markdown_to_html(markdown_text)

    return render(request, "encyclopedia/entry_page.html", {

    "content": html_text,
    "page_title": selected_entry

    })


def search(request):

    if request.method == "POST":
        
        # // capture the input from the user's search query
        search_input = request.POST['q']  
        markdown_input = util.get_entry(search_input)
        
        # // Handle the case if the search query do not match with the md
        if markdown_input is None:
            
            # Now, I need to get the list of all entries, then i'll compare
            # that with my search_input using "in" so that I can return a list
            # of recommendation based on what the user has input
            
            all_entries = util.list_entries()
            recommendation = []

            for entry in all_entries:

                # // Convert all to lowercase to make it easier to compare
                if search_input.lower() in entry.lower():
                    recommendation.append(entry)
            return render(request, "encyclopedia/search.html", {
                "recommendation_list": recommendation
            })
        else:
            html_text = util.convert_markdown_to_html(markdown_input)

            return render(request, "encyclopedia/entry_page.html", {
                "content": html_text,
                "page_title": search_input
            })


def create_entry(request):

    if request.method == "POST":
        
        # First, gather all the input from users
        new_entry_title = request.POST['new_markdown_title']
        new_entry_content = request.POST['new_markdown_content']

        all_existing_entries = util.list_entries()

        entry_already_existed = False

        for entry in all_existing_entries:
            if new_entry_title.lower() in entry.lower():
                entry_already_existed = True
                break
        
        if entry_already_existed == True:
            return render(request, "encyclopedia/entry_page.html", {
                "content": "Error! This entry already existed"
            })
        else: 

            # Then, I want to use save_entry to create the new entry
            new_entry_saved = util.save_entry(new_entry_title, new_entry_content)

            # After that, I can retrieve the new entry and redirect users there
            markdown_text = util.get_entry(new_entry_title)
            html_text = util.convert_markdown_to_html(markdown_text)

            return render(request, "encyclopedia/entry_page.html", {
                "content": html_text,
                "page_title": new_entry_title
            })
    
    # by default, we would still show users this create_page.html
    return render(request, "encyclopedia/create_page.html")



def edit_entry(request):
    
    if request.method == "POST":

        title_to_be_updated = request.POST['existing_entry']

        existing_markdown = util.get_entry(title_to_be_updated)
    
    return render(request, "encyclopedia/edit_page.html", {
        "content": existing_markdown,
        "title": title_to_be_updated
    })

# Rather than having to send 2 separate requests to edit_entry, I think
# it's better to create a separate function to handle save request

def save_edit(request):

    if request.method == "POST":

        title_to_be_updated = request.POST['existing_title']
        new_content = request.POST['updated_markdown_content']

        # Now, let's save the new content
        save_changes_to_md = util.save_entry(title_to_be_updated, new_content)

        # After I've saved, I can now retrieve the content
        markdown_text = util.get_entry(title_to_be_updated)
        html_text = util.convert_markdown_to_html(markdown_text)

    return render(request, "encyclopedia/entry_page.html", {
        "content": html_text,
        "page_title": title_to_be_updated
    })

# For randomization, we can use the existing Python function

def random_entry(request):
    
    all_entries = util.list_entries()
    randomize_page = random.choice(all_entries)

    selected_entry_md = util.get_entry(randomize_page)
    html_text = util.convert_markdown_to_html(selected_entry_md)

    return render(request, "encyclopedia/entry_page.html", {
        "content": html_text,
        "page_title": randomize_page
    })
