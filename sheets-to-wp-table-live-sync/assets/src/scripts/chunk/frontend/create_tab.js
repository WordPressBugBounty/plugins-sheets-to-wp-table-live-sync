jQuery(document).ready(function ($) {
    class ManageTab {
        constructor() {
            this.events();
            this.showFirstTabContent();
        }
        events() {
            var buttons = $('.tab_hidden_input');

            buttons.each(function () {
                $(this).on("click", function (e) {
                    let target = e.currentTarget;

                    $(target)
                        .parents(".tabs_container")
                        .find(`.tab_contents .tab-content`)
                        .removeClass("active");

                    let inputID = $(target).data("id");

                    $(`#${inputID}`).addClass('active');
                });
            })
        }

        showContent(e) {
            target
                .parents(".tab_bottom_side")
                .find(`.tab_contents .tab-content`)
                .removeClass("active");

            let inputID = target.attr("id").match(/(\d+)/)[0];

            target
                .parents(".tab_bottom_side")
                .find(`.tab_contents #tab-content${inputID}`)
                .addClass("active");
        }

        // Add checked in tabs and get the design.
          showFirstTabContent() {
            $(".tabs_container").each(function () {
              $(this)
                .find(".tab_hidden_input:first")
                .prop("checked", true);
            });
          }

    }
    new ManageTab();
});
