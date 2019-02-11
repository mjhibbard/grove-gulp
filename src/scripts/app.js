// $(document).on('click', function(){
//     alert("connected");
// });


$(document).ready(function(){
    $('nav li ul').hide().removeClass('dropDown-content');
    $('nav li').hover(
        function () {
            $('ul', this).stop().slideDown(500);
        },
        function () {
            $('ul', this).stop().slideUp(300);
        }
    );
    $('#header-bars-toggle').click(function() {
        $('#jQ-header__nav-menu').toggle('.active');
    });
});